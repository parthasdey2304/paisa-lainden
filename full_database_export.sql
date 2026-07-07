-- Database Export
-- Generated automatically

-- SCHEMA DEFINITION
-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  subjects INTEGER DEFAULT 1,
  monthly_fee INTEGER NOT NULL,
  class_year TEXT
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  month_key TEXT NOT NULL,
  payment_method TEXT DEFAULT 'offline'
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create basic policies for anon access (since there is no auth yet)
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON students FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON students FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON payments FOR DELETE USING (true);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  month_key TEXT NOT NULL
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON expenses FOR DELETE USING (true);


-- DATA DUMP

-- Students Data
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('3cdfd2aa-3f6d-40cd-a9e5-21035d567e9b', '2026-05-03T05:05:00.643922+00:00', 'Pratyush Ghosh', '', '+91 98742 46655', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('f923c0f8-964e-47e7-812f-017750016a5c', '2026-05-04T02:21:54.364287+00:00', 'Shankhayan Ray', '', '+91 98839 31463', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('dda34663-21d5-4b8a-a8b3-c23e571fa176', '2026-05-05T04:40:18.560343+00:00', 'Abhilasha Basu', '', '+91 84203 75561', 1, 1300);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('ffa710b1-3185-4c05-98ef-fb298aea84eb', '2026-05-05T04:41:21.262545+00:00', 'Chandrima Sengupta', '', '+91 877 727 6338', 1, 1300);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('36afad29-5eff-4830-a31b-ceb05b6e930a', '2026-05-05T04:45:02.383902+00:00', 'Adarsh Ghosh', '', '+91 70036 49164', 2, 1000);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('200194c2-75a3-4821-aae2-be0205111717', '2026-05-05T04:58:25.774254+00:00', 'Sagar Basak', '', '+91 98745 41028', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('d645f6d8-6551-45ef-823c-a7eb7e5576c1', '2026-05-05T05:03:35.827931+00:00', 'Parnashree Debnath', '', '+91 86979 20097', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('fc7915cf-ec0f-4f01-9982-065abcd6e91f', '2026-05-05T06:20:14.093203+00:00', 'Shrabasti Chatterjee', '', '9999999999', 1, 1000);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('3d102b92-2704-47c4-93fa-49eb511e2f38', '2026-05-06T07:33:41.51321+00:00', 'Arindam Ghosh', '', '9999999999', 1, 1500);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('2c2b7873-f7b1-4086-ba27-9884c24ec09b', '2026-05-07T13:47:29.987632+00:00', 'Tirtharaj Barkandaj', '', '9999999999', 1, 900);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('83839c45-5d2c-453b-9f68-232d5cb0d7af', '2026-05-03T05:03:51.238688+00:00', 'Roshan Jha', '', '+91 91634 86701', 1, 600);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('018a4795-f420-4062-a563-16990407c6d7', '2026-05-03T04:57:17.168971+00:00', 'Sridhee Chatterjee', '', '+91 98754 01548', 3, 2700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('42f04101-a9fe-4258-b5c9-55f87594cc89', '2026-07-04T14:27:47.463019+00:00', 'Soumyadeep Naskar', '', '9123740882', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('78f4e570-e922-4a47-a617-b3b8e37df64e', '2026-07-04T14:28:52.61924+00:00', 'Ranadeep Das', '', '7890744414', 1, 700);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('270b216f-a56f-4aa3-9236-1d07c12da1f8', '2026-06-20T05:33:18.415078+00:00', 'Anwesha Sardar', '', '99999', 1, 1000);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('fb04e9e2-e640-46ea-98f4-556b38c4a3da', '2026-05-05T04:42:12.570165+00:00', 'Tanishtha  Patra', '', '+91 79873 59377', 1, 1200);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('5247f51a-bb08-41fb-81ea-e9964736ecdd', '2026-05-03T04:56:20.858136+00:00', 'Adrish Ghosh', '', '+91 85848 85956', 1, 1000);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('aba51ac7-08ab-4082-9bdf-6d02dc9a0ba9', '2026-05-03T04:53:17.686433+00:00', 'Sudiptayan Panja', '', '+91 96742 61197', 1, 800);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('e07098d6-c59c-48f7-a8b1-34f15c2af8b6', '2026-05-03T05:12:23.280598+00:00', 'Srinika Kopti', '', '+91 877 745 5370', 1, 600);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('b3479626-f28a-4aff-b2e2-c1041047f75e', '2026-07-04T14:26:29.978644+00:00', 'Aditya Mishra', '', '9830376895', 1, 600);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('7b73be58-e218-4fa0-a1a0-3f89b4f7fd5e', '2026-05-05T06:19:49.36915+00:00', 'Ishita Banerjee', '', '999999999', 1, 1000);
INSERT INTO students (id, created_at, name, email, phone, subjects, monthly_fee) VALUES ('5570676d-7bca-4593-b781-b6adfed8dd88', '2026-05-04T09:18:16.078785+00:00', 'Nilavi Dey', '', '9804548038', 1, 1200);

-- Payments Data
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('2f5dec87-f5fa-4c3d-bd14-94be5dae7b97', '2026-05-06T08:39:03.626084+00:00', '018a4795-f420-4062-a563-16990407c6d7', 700, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('25df59b8-589f-46a1-9e61-d9192dc3bfa9', '2026-05-06T08:39:38.025638+00:00', 'f923c0f8-964e-47e7-812f-017750016a5c', 700, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('fc9b7030-cdb5-4833-896a-946467696f22', '2026-05-06T08:39:50.63135+00:00', '5570676d-7bca-4593-b781-b6adfed8dd88', 1200, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('efd08fb4-ec34-49f0-939b-d7c40241e523', '2026-05-06T08:40:03.463078+00:00', 'fb04e9e2-e640-46ea-98f4-556b38c4a3da', 1200, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('72ea4c2b-f9b7-493b-8ce9-52db33418e00', '2026-05-06T08:40:44.381932+00:00', '200194c2-75a3-4821-aae2-be0205111717', 700, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('1aa20963-de7b-459a-b038-755e5526925a', '2026-05-06T08:41:03.666211+00:00', '7b73be58-e218-4fa0-a1a0-3f89b4f7fd5e', 2000, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('f7d4da8c-52db-466f-892a-c542e3f37ed6', '2026-05-06T08:45:50.348637+00:00', 'aba51ac7-08ab-4082-9bdf-6d02dc9a0ba9', 800, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('ffac66b6-3fdf-4686-8ed3-a7a30dffd733', '2026-05-08T04:31:08.977218+00:00', '2c2b7873-f7b1-4086-ba27-9884c24ec09b', 900, '2026-05-08', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('141c8a11-d030-41ac-a4bb-edc1ecd5b164', '2026-05-12T00:47:35.605688+00:00', '5247f51a-bb08-41fb-81ea-e9964736ecdd', 1000, '2026-05-12', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('12fa55e3-b457-4539-b712-7e80f7ec37ec', '2026-05-12T10:48:14.90813+00:00', 'ffa710b1-3185-4c05-98ef-fb298aea84eb', 1300, '2026-05-12', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('6a7272df-267b-4789-a5ad-5fca7e688694', '2026-05-19T10:29:45.06077+00:00', '83839c45-5d2c-453b-9f68-232d5cb0d7af', 1000, '2026-05-19', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('f3975c7d-01f1-4819-9e85-fbc9380ee52c', '2026-05-19T10:30:02.752534+00:00', '36afad29-5eff-4830-a31b-ceb05b6e930a', 1000, '2026-05-18', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('c726bd35-6764-4cec-a14a-ba34716dd31a', '2026-05-21T12:07:24.418456+00:00', 'fc7915cf-ec0f-4f01-9982-065abcd6e91f', 2000, '2026-05-20', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('ba3f0b15-1bed-4a6c-b2a5-b9ce31abe478', '2026-05-23T16:18:57.858412+00:00', 'e07098d6-c59c-48f7-a8b1-34f15c2af8b6', 600, '2026-05-23', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('466e9e78-5329-4647-82a8-ba4dcc55fdd1', '2026-05-24T05:26:44.933864+00:00', 'd645f6d8-6551-45ef-823c-a7eb7e5576c1', 800, '2026-05-24', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('fe3d4669-3e88-4eea-a22e-9f743e64f0ad', '2026-05-26T13:32:31.071125+00:00', '3d102b92-2704-47c4-93fa-49eb511e2f38', 1500, '2026-05-26', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('fef2dd69-356c-47db-a00f-dc6fb7da7d35', '2026-06-12T05:15:56.043233+00:00', 'aba51ac7-08ab-4082-9bdf-6d02dc9a0ba9', 800, '2026-06-05', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('0071ac03-ae18-4477-9aa5-db794013497f', '2026-06-12T05:17:47.048108+00:00', 'fb04e9e2-e640-46ea-98f4-556b38c4a3da', 1200, '2026-06-03', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('8a1d4701-c57b-4e25-ac23-84c90961b73d', '2026-06-12T05:20:52.867986+00:00', '5247f51a-bb08-41fb-81ea-e9964736ecdd', 1000, '2026-06-02', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('ad02e3e7-16fd-4805-a200-22a821206f99', '2026-06-12T05:33:15.788361+00:00', '2c2b7873-f7b1-4086-ba27-9884c24ec09b', 800, '2026-06-02', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('9487543d-38b2-47ce-9272-671d2d63d97f', '2026-06-20T05:32:17.055187+00:00', 'dda34663-21d5-4b8a-a8b3-c23e571fa176', 1300, '2026-06-13', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('82725932-2501-4daf-b218-30fef453be73', '2026-06-20T05:32:37.123261+00:00', 'ffa710b1-3185-4c05-98ef-fb298aea84eb', 1300, '2026-06-13', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('a7615667-ce56-4db5-9f8b-c5466bc9c937', '2026-06-20T05:34:37.212518+00:00', '83839c45-5d2c-453b-9f68-232d5cb0d7af', 600, '2026-06-13', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('785b50ea-6674-4832-810e-aeadbe5f2d38', '2026-06-20T05:36:18.383484+00:00', 'e07098d6-c59c-48f7-a8b1-34f15c2af8b6', 600, '2026-06-13', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('07b3b6fd-87e0-47bd-bea2-2c52ec2e163c', '2026-06-20T05:36:40.828269+00:00', 'f923c0f8-964e-47e7-812f-017750016a5c', 1200, '2026-06-13', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('2dfbc764-d961-43bb-af62-a06f05441bfe', '2026-06-20T06:12:28.059389+00:00', '5570676d-7bca-4593-b781-b6adfed8dd88', 1200, '2026-06-14', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('ffc1882f-88aa-4e61-899f-2cc4db5fbf38', '2026-06-27T14:07:57.220447+00:00', '3cdfd2aa-3f6d-40cd-a9e5-21035d567e9b', 700, '2026-06-27', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('8d95da12-004a-4263-8eb5-e74822014165', '2026-06-27T14:08:17.977754+00:00', '3d102b92-2704-47c4-93fa-49eb511e2f38', 1500, '2026-06-27', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('d8059865-667e-400e-bb91-eb652b808e30', '2026-06-27T16:08:28.766712+00:00', '200194c2-75a3-4821-aae2-be0205111717', 700, '2026-06-27', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('2aa92e16-73ff-4535-a7f6-ccc2a50973d4', '2026-07-04T10:31:37.202281+00:00', '7b73be58-e218-4fa0-a1a0-3f89b4f7fd5e', 1000, '2026-07-03', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('cde19605-210f-48e5-a8d6-4c22b6ebe58e', '2026-07-04T10:58:11.659876+00:00', '7b73be58-e218-4fa0-a1a0-3f89b4f7fd5e', 1000, '2026-07-03', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('3830261e-e35d-4bcd-a00b-9f4030bb7bcf', '2026-07-04T11:53:59.739575+00:00', '018a4795-f420-4062-a563-16990407c6d7', 2700, '2026-07-02', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('d195a30e-24f8-47ff-ade9-9055437134ad', '2026-07-04T12:02:10.074803+00:00', 'aba51ac7-08ab-4082-9bdf-6d02dc9a0ba9', 800, '2026-07-03', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('0bda30cc-6808-47d1-b425-cddab31049f9', '2026-07-04T12:12:57.102936+00:00', '3cdfd2aa-3f6d-40cd-a9e5-21035d567e9b', 700, '2026-05-27', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('4e2fabdb-5c24-4a54-96fd-b6ca6523531e', '2026-07-04T12:19:09.281187+00:00', '270b216f-a56f-4aa3-9236-1d07c12da1f8', 2000, '2026-05-06', '2026-05');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('e99d8539-ba1b-4ef8-a829-3b98a453a98b', '2026-07-04T16:32:20.983872+00:00', 'b3479626-f28a-4aff-b2e2-c1041047f75e', 600, '2026-07-04', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('4c7964e1-1644-48fb-97dd-8b2bb3bb1e28', '2026-07-04T16:34:06.481566+00:00', '5570676d-7bca-4593-b781-b6adfed8dd88', 1200, '2026-07-04', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('52815bba-5718-4781-be45-ced00e15399c', '2026-07-04T16:49:15.977414+00:00', 'fb04e9e2-e640-46ea-98f4-556b38c4a3da', 1200, '2026-07-02', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('5bd16971-74df-488d-a112-417b25f395ed', '2026-07-04T16:53:14.494202+00:00', '270b216f-a56f-4aa3-9236-1d07c12da1f8', 1000, '2026-07-01', '2026-06');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('264ee2e5-f469-42bf-b66b-345d50a5940d', '2026-07-06T05:47:00.566519+00:00', 'e07098d6-c59c-48f7-a8b1-34f15c2af8b6', 800, '2026-07-06', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('5f92718c-0119-487c-ac12-40e1a3d3cd96', '2026-07-06T05:47:35.230116+00:00', 'b3479626-f28a-4aff-b2e2-c1041047f75e', 600, '2026-07-05', '2026-07');
INSERT INTO payments (id, created_at, student_id, amount, payment_date, month_key) VALUES ('9a395101-7a37-47c8-b6e8-d777067b1fe7', '2026-07-06T11:43:11.671352+00:00', '5247f51a-bb08-41fb-81ea-e9964736ecdd', 1000, '2026-07-06', '2026-07');

