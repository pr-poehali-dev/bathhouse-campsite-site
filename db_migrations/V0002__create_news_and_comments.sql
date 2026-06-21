CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    body TEXT NOT NULL,
    tag VARCHAR(50) DEFAULT 'Новость',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_comments (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL REFERENCES news(id),
    parent_id INTEGER REFERENCES news_comments(id),
    author VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO news (title, body, tag) VALUES
('Открытие новой купели на территории', 'Рады сообщить, что на территории базы открылась новая дубовая купель с природной родниковой водой. Температура поддерживается автоматически. Купель доступна всем гостям в составе суточного пакета.', 'Новость'),
('Акция «Зимний отдых» — скидка 20%', 'С 1 по 28 февраля дарим скидку 20% на все выходные. Укажите промокод ЗИМА2026 при бронировании. Акция действует при заезде от двух суток.', 'Акция'),
('Новое меню от шеф-повара', 'Теперь гости могут заказать горячие блюда прямо в домик: уха, шашлык из леща, блины с икрой и многое другое. Меню составлено из продуктов от местных фермеров.', 'Новость');