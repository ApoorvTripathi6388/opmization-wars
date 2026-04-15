/// Inverted index construction.
///
/// Builds a mapping from term_id → list of (doc_id, term_freq) for efficient
/// query lookup.  Uses a BTreeMap for sorted, reproducible term ordering
/// that is consistent across runs.
///
/// Construction is thread-safe: multiple workers share a single locked index
/// so that concurrent builds produce deterministic results.
use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};
use std::thread;

use crate::types::*;

/// Build the inverted index from the document corpus.
///
/// Spawns worker threads that each process a slice of documents,
/// inserting into a shared locked map.
pub fn build_index(docs: &[Document]) -> BTreeMap<u32, PostingList> {
    let index: Arc<Mutex<BTreeMap<u32, PostingList>>> =
        Arc::new(Mutex::new(BTreeMap::new()));

    let num_threads = 4;
    let chunk_size = (docs.len() + num_threads - 1) / num_threads;

    let docs_arc = Arc::new(docs.to_vec());

    let handles: Vec<_> = (0..num_threads)
        .map(|t| {
            let index = Arc::clone(&index);
            let docs = Arc::clone(&docs_arc);
            thread::spawn(move || {
                let start = t * chunk_size;
                let end = (start + chunk_size).min(docs.len());
                for doc in &docs[start..end] {
                    for &(term_id, count) in &doc.terms {
                        let mut idx = index.lock().unwrap();
                        let posting = idx.entry(term_id).or_insert_with(|| PostingList {
                            term_id,
                            entries: Vec::new(),
                        });
                        posting.entries.push(PostingEntry {
                            doc_id: doc.id,
                            term_freq: count,
                        });
                    }
                }
            })
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }

    Arc::try_unwrap(index).unwrap().into_inner().unwrap()
}
