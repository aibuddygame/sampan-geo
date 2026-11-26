export interface SearchResultItem {
  rank?: number;
  title?: string;
  href?: string;
  body?: string;
  matches_target?: boolean;
}

export interface StepTelemetry {
  query?: string;
  result_count?: number;
  target_hit_count?: number;
  results?: SearchResultItem[];
  url?: string;
  final_url?: string | null;
  title?: string;
  topic?: string;
  matches_target?: boolean;
  status_code?: number | null;
  full_extracted_chars?: number;
  extracted_chars?: number;
  focused_output_chars?: number;
  extracted_preview?: string;
  focused_extract?: string;
  duration_ms?: number;
  error?: string | null;
}

export interface TraceStep {
  id?: string;
  seq: number;
  tool_name: string;
  arguments: Record<string, unknown>;
  model_output: string;
  telemetry: StepTelemetry;
}

export interface RunRecord {
  id: string;
  question: string;
  target_url?: string | null;
  target_domain?: string | null;
  model?: string;
  status: string;
  final_answer?: string | null;
  step_count?: number;
  error?: string | null;
}
