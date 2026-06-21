CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rating SMALLINT NOT NULL DEFAULT 5,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO reviews (name, rating, text, created_at) VALUES
('Анна и Сергей', 5, 'Отдыхали всей семьёй на выходных. Баня — огонь! Домик тёплый, вокруг тишина и сосны. Обязательно вернёмся зимой.', NOW() - INTERVAL '5 days'),
('Дмитрий', 5, 'Идеальное место, чтобы отключиться от города. Воздух, природа, парная с вениками. Хозяева очень душевные.', NOW() - INTERVAL '12 days'),
('Марина', 4, 'Очень уютно и красиво. Терраса с купелью — это что-то невероятное вечером под звёздами. Спасибо за отдых!', NOW() - INTERVAL '20 days');