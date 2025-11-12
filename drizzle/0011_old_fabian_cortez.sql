CREATE TABLE `document_test_evals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` integer NOT NULL,
	`gemini_document_type` text,
	`gemini_expiry_date` text,
	`gemini_confidence` text,
	`gemini_notes` text,
	`expected_document_type` text,
	`expected_expiry_date` text,
	`is_correct` integer,
	`created_at` integer NOT NULL
);
