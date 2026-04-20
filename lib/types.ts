export interface ATSResult {
  analytics_data: {
    inferred_primary_role: string;
    total_months_experience: number;
    categorized_skills: {
      technical_frameworks: string[];
      tools_and_platforms: string[];
      soft_leadership: string[];
    };
  };
  ats_scoring: {
    overall_semantic_match_score: number;
    blind_spot_detection: {
      missing_critical_skills: string[];
      market_context_reasoning: string;
    };
  };
  authenticity_index: {
    trust_score: number;
    fluff_flags: string[];
    chronological_discrepancies: string[];
  };
  interactive_chatbot: {
    weak_bullets_identified: Array<{
      original_bullet: string;
      probing_question_english: string;
    }>;
  };
  resume_improvement?: {
    semantic_job_match_summary: string;
    impact_enforcer_suggestions: string[];
    skill_gap_suggestions: string[];
    section_balance_suggestions: string[];
    cliche_fluff_flags: string[];
    role_suggestions: string[];
  };
  ats_parsing_sandbox?: {
    extracted_preview: string;
    parser_warnings: string[];
  };
  alternate_universe_personas: {
    corporate_formal_summary: string;
    startup_creative_summary: string;
  };
  email_marketing: {
    freemium_teaser_copy: string;
  };
}

export interface KaggleResume {
  id: string;
  category: string;
  resume_text: string;
}
