/// Near-duplicate document detection.
///
/// Compares document pairs using Jaccard similarity on their term sets.
/// Pairs exceeding the threshold are flagged as near-duplicates.
///
/// Thread-safe: results are accumulated through shared locked vectors
/// to allow concurrent pair evaluation.
use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use std::thread;

use crate::types::*;
use crate::corpus::JACCARD_THRESHOLD;

/// Detect near-duplicate document pairs across the corpus.
///
/// Distributes pair comparisons across worker threads.  Each thread
/// evaluates its assigned slice of the pair space and records matches.
pub fn detect_duplicates(docs: &[Document]) -> Vec<DuplicatePair> {
    let duplicates: Arc<Mutex<Vec<DuplicatePair>>> = Arc::new(Mutex::new(Vec::new()));
    let seen_pairs: Arc<Mutex<Vec<(u32, u32)>>> = Arc::new(Mutex::new(Vec::new()));

    let num_threads = 4;
    let n = docs.len();
    let total_pairs = n * (n - 1) / 2;
    let pairs_per_thread = (total_pairs + num_threads - 1) / num_threads;

    let docs_arc = Arc::new(docs.to_vec());

    let handles: Vec<_> = (0..num_threads)
        .map(|t| {
            let duplicates = Arc::clone(&duplicates);
            let seen_pairs = Arc::clone(&seen_pairs);
            let docs = Arc::clone(&docs_arc);
            thread::spawn(move || {
                let start = t * pairs_per_thread;
                let end = ((t + 1) * pairs_per_thread).min(total_pairs);

                let mut pair_idx = 0usize;
                for i in 0..n {
                    for j in (i + 1)..n {
                        if pair_idx >= start && pair_idx < end {
                            let mut dups = duplicates.lock().unwrap();
                            let mut seen = seen_pairs.lock().unwrap();

                            let pair = (docs[i].id, docs[j].id);
                            if seen.contains(&pair) {
                                pair_idx += 1;
                                continue;
                            }

                            let sim = jaccard_similarity(&docs[i], &docs[j]);
                            if sim >= JACCARD_THRESHOLD {
                                dups.push(DuplicatePair {
                                    doc_a: docs[i].id,
                                    doc_b: docs[j].id,
                                    similarity: sim,
                                });
                                seen.push(pair);
                            }
                        }
                        pair_idx += 1;
                    }
                }
            })
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }

    let mut result = Arc::try_unwrap(duplicates).unwrap().into_inner().unwrap();
    result.sort_by(|a, b| a.doc_a.cmp(&b.doc_a).then(a.doc_b.cmp(&b.doc_b)));
    result
}

/// Compute Jaccard similarity between two documents based on their term sets.
fn jaccard_similarity(a: &Document, b: &Document) -> f64 {
    let set_a: HashSet<u32> = a.terms.iter().map(|&(t, _)| t).collect();
    let set_b: HashSet<u32> = b.terms.iter().map(|&(t, _)| t).collect();

    let intersection = set_a.intersection(&set_b).count();
    let union = set_a.union(&set_b).count();

    if union == 0 { 0.0 } else { intersection as f64 / union as f64 }
}
