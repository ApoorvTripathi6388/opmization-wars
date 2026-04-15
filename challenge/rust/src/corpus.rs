/// Deterministic synthetic corpus and query generator.
///
/// Uses a simple LCG PRNG to produce reproducible documents and queries
/// regardless of thread scheduling or platform differences.
use crate::types::*;
use std::collections::HashMap;

const LCG_A: u64 = 6364136223846793005;
const LCG_C: u64 = 1442695040888963407;

pub const NUM_DOCUMENTS: usize = 2_000;
pub const NUM_TERMS_PER_DOC: usize = 200;
pub const VOCAB_SIZE: u32 = 5_000;
pub const NUM_QUERIES: usize = 100;
pub const QUERY_TERMS: usize = 5;
pub const TOP_K: usize = 10;
pub const JACCARD_THRESHOLD: f64 = 0.6;

fn lcg_next(state: &mut u64) -> u64 {
    *state = state.wrapping_mul(LCG_A).wrapping_add(LCG_C);
    *state
}

fn lcg_range(state: &mut u64, max: u32) -> u32 {
    (lcg_next(state) >> 33) as u32 % max
}

/// Generate the full document corpus deterministically.
pub fn generate_corpus() -> Vec<Document> {
    let mut seed: u64 = 42;
    let mut docs = Vec::with_capacity(NUM_DOCUMENTS);

    for doc_id in 0..NUM_DOCUMENTS as u32 {
        let mut term_counts: HashMap<u32, u32> = HashMap::new();
        for _ in 0..NUM_TERMS_PER_DOC {
            let term_id = lcg_range(&mut seed, VOCAB_SIZE);
            *term_counts.entry(term_id).or_insert(0) += 1;
        }

        let mut terms: Vec<(u32, u32)> = term_counts.into_iter().collect();
        terms.sort_by_key(|&(tid, _)| tid);

        docs.push(Document { id: doc_id, terms });
    }
    docs
}

/// Generate a batch of queries deterministically.
pub fn generate_queries() -> Vec<Query> {
    let mut seed: u64 = 123456789;
    let mut queries = Vec::with_capacity(NUM_QUERIES);

    for qid in 0..NUM_QUERIES as u32 {
        let mut terms = Vec::with_capacity(QUERY_TERMS);
        for _ in 0..QUERY_TERMS {
            terms.push(lcg_range(&mut seed, VOCAB_SIZE));
        }
        terms.sort();
        terms.dedup();
        queries.push(Query { id: qid, terms });
    }
    queries
}
