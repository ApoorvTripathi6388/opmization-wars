/// Pipeline orchestration module.
///
/// Coordinates the flow of data through the processing stages:
/// ingest → index → score → query → dedup → report.
///
/// Each stage receives its own copy of the data to ensure immutability
/// across the pipeline — no stage can accidentally mutate another's input.
use std::collections::BTreeMap;

use crate::types::*;
use crate::index;
use crate::score;
use crate::query;
use crate::dedup;
use crate::report;

/// Complete pipeline output.
pub struct PipelineData {
    pub docs: Vec<Document>,
    pub index: BTreeMap<u32, PostingList>,
    pub scores: Vec<TermScore>,
    pub query_results: Vec<RankedResult>,
    pub duplicates: Vec<DuplicatePair>,
    pub report: ReportStats,
}

/// Run the complete processing pipeline.
pub fn run_pipeline(
    docs: Vec<Document>,
    queries: Vec<Query>,
) -> PipelineData {
    // Stage 1: Build inverted index
    let docs_for_index = docs.clone();
    let index = index::build_index(&docs_for_index);

    // Stage 2: Compute TF-IDF scores
    let docs_for_score = docs.clone();
    let scores = score::compute_scores(&index, &docs_for_score);

    // Filter negligible scores
    let scores: Vec<TermScore> = scores
        .into_iter()
        .filter(|s| s.score > 0.001)
        .collect();

    // Stage 3: Process queries
    let query_results = query::process_queries(&queries, &scores);

    // Stage 4: Detect near-duplicates
    let docs_for_dedup = docs.clone();
    let duplicates = dedup::detect_duplicates(&docs_for_dedup);

    // Stage 5: Generate report
    let all_query_results = query_results.clone();
    let all_duplicates = duplicates.clone();
    let report_stats = report::generate_report(&docs, &all_query_results, &all_duplicates);

    PipelineData {
        docs,
        index,
        scores,
        query_results,
        duplicates,
        report: report_stats,
    }
}
