/// Data types for the text ranking engine.
///
/// These structures model the core entities in a document retrieval system:
/// documents, inverted index entries, TF-IDF scores, queries, and results.

/// A single document: an ID and a sorted list of (term_id, frequency) pairs.
#[derive(Debug, Clone)]
pub struct Document {
    pub id: u32,
    pub terms: Vec<(u32, u32)>,
}

/// Inverted index entry: a term pointing to documents containing it.
#[derive(Debug, Clone)]
pub struct PostingList {
    pub term_id: u32,
    pub entries: Vec<PostingEntry>,
}

/// A single posting: a document that contains a given term.
#[derive(Debug, Clone)]
pub struct PostingEntry {
    pub doc_id: u32,
    pub term_freq: u32,
}

/// TF-IDF score for a (term, document) pair.
#[derive(Debug, Clone)]
pub struct TermScore {
    pub term_id: u32,
    pub doc_id: u32,
    pub score: f64,
}

/// Query: a list of term IDs to search for.
#[derive(Debug, Clone)]
pub struct Query {
    pub id: u32,
    pub terms: Vec<u32>,
}

/// A single query result (document ID + relevance score).
#[derive(Debug, Clone)]
pub struct QueryResult {
    pub query_id: u32,
    pub doc_id: u32,
    pub score: f64,
}

/// Per-query ranked results.
#[derive(Debug, Clone)]
pub struct RankedResult {
    pub query_id: u32,
    pub top_docs: Vec<QueryResult>,
}

/// A near-duplicate document pair.
#[derive(Debug, Clone)]
pub struct DuplicatePair {
    pub doc_a: u32,
    pub doc_b: u32,
    pub similarity: f64,
}

/// Aggregated report statistics.
#[derive(Debug, Clone, Default)]
pub struct ReportStats {
    pub total_documents: usize,
    pub total_terms: usize,
    pub avg_doc_length: f64,
    pub total_queries: usize,
    pub avg_query_score: f64,
    pub total_duplicates: usize,
    pub avg_similarity: f64,
}
