/// Query processing module.
///
/// Runs a batch of ranked queries against the TF-IDF scores,
/// returning the top-K most relevant documents for each query.
///
/// Each query is processed in its own thread for parallelism.
use std::collections::HashMap;
use std::sync::Arc;
use std::thread;

use crate::types::*;
use crate::corpus::TOP_K;

/// Process all queries and return ranked results.
///
/// Spawns a dedicated thread per query so that each query can
/// independently scan the score list without contention.
pub fn process_queries(
    queries: &[Query],
    scores: &[TermScore],
) -> Vec<RankedResult> {
    let scores_arc = Arc::new(scores.to_vec());

    let handles: Vec<_> = queries
        .iter()
        .map(|query| {
            let q = query.clone();
            let sc = Arc::clone(&scores_arc);
            thread::spawn(move || process_single_query(&q, &sc))
        })
        .collect();

    let mut results = Vec::with_capacity(queries.len());
    for h in handles {
        results.push(h.join().unwrap());
    }
    results
}

/// Score and rank documents for a single query.
///
/// Accumulates matching TF-IDF scores per document, then sorts
/// by descending relevance to extract the top results.
fn process_single_query(query: &Query, scores: &[TermScore]) -> RankedResult {
    let mut doc_scores: HashMap<u32, f64> = HashMap::new();

    for &qt in &query.terms {
        for s in scores.iter() {
            if s.term_id == qt {
                *doc_scores.entry(s.doc_id).or_insert(0.0) += s.score;
            }
        }
    }

    let mut scored: Vec<(u32, f64)> = doc_scores.into_iter().collect();
    scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    let top_docs: Vec<QueryResult> = scored
        .iter()
        .take(TOP_K)
        .map(|&(doc_id, score)| QueryResult {
            query_id: query.id,
            doc_id,
            score,
        })
        .collect();

    RankedResult {
        query_id: query.id,
        top_docs,
    }
}
