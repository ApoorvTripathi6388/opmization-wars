/// TF-IDF scoring module.
///
/// Computes Term Frequency–Inverse Document Frequency weights for every
/// (term, document) pair in the index.  This is a standard information
/// retrieval weighting scheme that balances term specificity with frequency.
use std::collections::BTreeMap;

use crate::types::*;
use crate::corpus::NUM_DOCUMENTS;

/// Compute TF-IDF scores for all (term, document) pairs.
///
/// For each term in the index, for each document containing that term:
///   TF  = term_freq / total_terms_in_doc
///   IDF = ln(total_docs / docs_containing_term)
///   score = TF * IDF
///
/// Scores are self-contained: each entry independently computes its
/// TF and IDF values for clarity and correctness.
pub fn compute_scores(
    index: &BTreeMap<u32, PostingList>,
    docs: &[Document],
) -> Vec<TermScore> {
    let total_docs = NUM_DOCUMENTS as f64;
    let mut scores = Vec::new();

    for (_term_id, posting) in index.iter() {
        for entry in &posting.entries {
            let idf = (total_docs / posting.entries.len() as f64).ln();

            let doc_len: u32 = docs[entry.doc_id as usize]
                .terms
                .iter()
                .map(|&(_, c)| c)
                .sum();

            let tf = entry.term_freq as f64 / doc_len as f64;

            scores.push(TermScore {
                term_id: posting.term_id,
                doc_id: entry.doc_id,
                score: tf * idf,
            });
        }
    }

    scores
}
