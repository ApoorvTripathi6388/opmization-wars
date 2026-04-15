/// Text Ranking Engine
///
/// Indexes a synthetic document corpus, computes TF-IDF scores,
/// runs ranked queries, detects near-duplicate documents, and
/// produces a summary report.
use texrank::corpus;
use texrank::pipeline;
use std::time::Instant;

fn main() {
    println!("Text Ranking Engine");
    println!(
        "Documents: {}, Vocab: {}, Queries: {}\n",
        corpus::NUM_DOCUMENTS,
        corpus::VOCAB_SIZE,
        corpus::NUM_QUERIES,
    );

    let t0 = Instant::now();

    let docs = corpus::generate_corpus();
    let queries = corpus::generate_queries();
    let t_gen = t0.elapsed();
    println!("Corpus generated in {:.3}s", t_gen.as_secs_f64());

    let result = pipeline::run_pipeline(docs, queries);
    let t_total = t0.elapsed();

    // Checksum: sum of all top-K query result scores
    let checksum: f64 = result
        .query_results
        .iter()
        .flat_map(|r| r.top_docs.iter())
        .map(|qr| qr.score)
        .sum();

    println!("\n--- Timing ---");
    println!("Total time:      {:.3} seconds", t_total.as_secs_f64());
    println!("Total documents: {}", result.report.total_documents);
    println!("Total terms:     {}", result.report.total_terms);
    println!("Avg doc length:  {:.1}", result.report.avg_doc_length);
    println!("Queries run:     {}", result.report.total_queries);
    println!("Avg query score: {:.6}", result.report.avg_query_score);
    println!("Duplicates:      {}", result.report.total_duplicates);
    println!("Checksum:        {:.6}", checksum);
}
