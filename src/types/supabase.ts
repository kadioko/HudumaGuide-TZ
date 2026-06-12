export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AnyTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      account_deletion_file_cleanup: AnyTable;
      analytics_events: AnyTable;
      app_disclaimers: AnyTable;
      business_profiles: AnyTable;
      business_roadmap_steps: AnyTable;
      business_roadmaps: AnyTable;
      business_scenarios: AnyTable;
      content_change_logs: AnyTable;
      feedback_reports: AnyTable;
      msaidizi_audit_logs: AnyTable;
      msaidizi_audit_reviews: AnyTable;
      official_links: AnyTable;
      profiles: AnyTable;
      service_categories: AnyTable;
      service_faqs: AnyTable;
      service_guides: AnyTable;
      service_required_documents: AnyTable;
      service_steps: AnyTable;
      user_checklist_items: AnyTable;
      user_documents: AnyTable;
      user_reminders: AnyTable;
      user_saved_guides: AnyTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
