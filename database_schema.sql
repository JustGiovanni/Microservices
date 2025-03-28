-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

-- Insert Sample Categories Data
INSERT INTO categories (name)
VALUES
  ('Science'),
  ('Technology'),
  ('Math'),
  ('History'),
  ('Geography');

-- Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_text TEXT NOT NULL,
  answer_1 TEXT NOT NULL,
  answer_2 TEXT NOT NULL,
  answer_3 TEXT NOT NULL,
  answer_4 TEXT NOT NULL,
  correct_answer INT NOT NULL, -- 1 for answer_1, 2 for answer_2, etc.
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert Sample Questions Data
INSERT INTO questions (question_text, answer_1, answer_2, answer_3, answer_4, correct_answer, category_id)
VALUES
  ('What is the chemical symbol for water?', 'H2O', 'O2', 'CO2', 'H2', 1, 1),  -- Science
  ('Who invented the telephone?', 'Alexander Graham Bell', 'Thomas Edison', 'Nikola Tesla', 'Albert Einstein', 1, 2),  -- Technology
  ('What is 5 + 7?', '10', '12', '15', '8', 2, 3),  -- Math
  ('Who was the first president of the USA?', 'Abraham Lincoln', 'George Washington', 'John Adams', 'Thomas Jefferson', 2, 4),  -- History
  ('What is the capital of France?', 'Paris', 'London', 'Berlin', 'Rome', 1, 5);  -- Geography
