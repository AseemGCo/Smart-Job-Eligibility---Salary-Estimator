-- ============================================================
--  TalentScope — Sample / Seed Data
--  Run AFTER schema.sql.
--
--  All demo accounts share the password:  Password@123
--  (stored only as a bcrypt hash — never plain text)
--
--  Demo accounts:
--    priya@example.com      (role: user)
--    karan@example.com      (role: user)
--    demoadmin@example.com  (role: admin)
-- ============================================================

USE `talentscope`;

-- Clear existing demo rows (safe to re-run). Order respects FK.
DELETE FROM `candidates`;
DELETE FROM `users`;
ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `candidates` AUTO_INCREMENT = 1;

-- ------------------------------------------------------------
--  Users  (bcrypt hash below is for "Password@123")
-- ------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
  (1, 'Priya Sharma', 'priya@example.com',
      '$2a$12$/zqYj9a.Xusr8typmXbb3..UbSHt47R24QxNDe6nOcfHa9fLxon0K', 'user'),
  (2, 'Karan Verma', 'karan@example.com',
      '$2a$12$/zqYj9a.Xusr8typmXbb3..UbSHt47R24QxNDe6nOcfHa9fLxon0K', 'user'),
  (3, 'Demo Admin', 'demoadmin@example.com',
      '$2a$12$/zqYj9a.Xusr8typmXbb3..UbSHt47R24QxNDe6nOcfHa9fLxon0K', 'admin');

-- ------------------------------------------------------------
--  Candidates  (computed fields match the backend rules engine)
-- ------------------------------------------------------------
INSERT INTO `candidates`
  (`user_id`, `candidate_name`, `age`, `education`, `skill_score`, `projects`, `relocate`,
   `eligibility`, `priority_status`, `confidence_level`, `salary_min`, `salary_max`,
   `ranking_score`, `suggestions`)
VALUES
  -- Priya's candidates --------------------------------------------------------
  (1, 'Aarav Sharma', 24, 'Postgraduate', 88, 5, 'Yes',
      'Eligible', 1, 'High', 12.0, 20.0, 86.6,
      JSON_ARRAY('Excellent profile! You meet all priority criteria — keep it up. 🚀')),

  (1, 'Diya Patel', 22, 'Graduate', 75, 3, 'No',
      'Eligible', 0, 'Medium', 6.0, 10.0, 67.5,
      JSON_ARRAY(
        'Push your JS skill score above 80 to qualify as a priority candidate.',
        'Consider relocation — it adds ₹1 LPA to your estimated salary.',
        'A postgraduate qualification can add ₹1 LPA to your salary estimate.')),

  (1, 'Rohan Mehta', 19, 'Non-IT Background', 52, 1, 'Yes',
      'Not Eligible', 0, 'Low', 0.0, 0.0, 41.4,
      JSON_ARRAY(
        'Improve JavaScript fundamentals and build more projects.',
        'Complete at least 2 practical projects to become eligible.')),

  -- Karan's candidates --------------------------------------------------------
  (2, 'Sneha Iyer', 27, 'Postgraduate', 94, 6, 'No',
      'Eligible', 1, 'High', 11.0, 19.0, 95.8,
      JSON_ARRAY('Consider relocation — it adds ₹1 LPA to your estimated salary.')),

  (2, 'Vikram Nair', 30, 'Graduate', 65, 2, 'Yes',
      'Eligible', 0, 'Medium', 5.0, 7.0, 55.5,
      JSON_ARRAY(
        'Push your JS skill score above 80 to qualify as a priority candidate.',
        'Build one more project to reach priority status and boost confidence.',
        'A postgraduate qualification can add ₹1 LPA to your salary estimate.')),

  (2, 'Ananya Gupta', 26, 'Postgraduate', 82, 4, 'Yes',
      'Eligible', 1, 'High', 8.0, 12.0, 77.4,
      JSON_ARRAY('Excellent profile! You meet all priority criteria — keep it up. 🚀'));
