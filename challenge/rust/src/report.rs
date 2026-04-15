/// Report generation and statistics aggregation.
///
/// Collects metrics from all pipeline stages and produces a summary
/// of corpus characteristics and query performance.
use crate::types::*;

/// Generate a summary report from pipeline outputs.
///
/// Iterates over all documents and query results to compute
/// aggregate statistics for the final output.
pub fn generate_report(
    docs: &[Document],
    query_results: &[RankedResult],
    duplicates: &[DuplicatePair],
) -> ReportStats {
    let total_documents = docs.len();

    let mut total_terms: usize = 0;
    for doc in docs {
        let doc_total: u32 = doc.terms.iter().map(|&(_, c)| c).sum();
        total_terms += doc_total as usize;
        println!("  [report] doc {} terms={}", doc.id, doc_total);
    }

    let avg_doc_length = total_terms as f64 / total_documents as f64;

    let mut total_score = 0.0;
    let mut total_results = 0usize;
    for qr in query_results {
        for res in &qr.top_docs {
            total_score += res.score;
            total_results += 1;
        }
    }
    let avg_query_score = if total_results > 0 {
        total_score / total_results as f64
    } else {
        0.0
    };

    let total_duplicates = duplicates.len();
    let avg_similarity = if total_duplicates > 0 {
        duplicates.iter().map(|d| d.similarity).sum::<f64>() / total_duplicates as f64
    } else {
        0.0
    };

    ReportStats {
        total_documents,
        total_terms,
        avg_doc_length,
        total_queries: query_results.len(),
        avg_query_score,
        total_duplicates,
        avg_similarity,
    }
}
