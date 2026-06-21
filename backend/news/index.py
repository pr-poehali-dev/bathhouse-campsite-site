import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
}


def ok(data):
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def is_admin(event):
    pwd = (event.get('headers') or {}).get('X-Admin-Password', '')
    return pwd == os.environ.get('ADMIN_PASSWORD', '')


def handler(event: dict, context) -> dict:
    """
    Лента новостей и комментариев базы отдыха «Банная заимка».
    Роутинг через ?action=:
      GET  /               — список новостей
      POST /?action=create — создать новость (admin)
      POST /?action=delete_news&id=N — удалить новость (admin)
      GET  /?action=comments&news_id=N — комментарии
      POST /?action=comment — добавить комментарий
      POST /?action=delete_comment&id=N — удалить комментарий (admin)
      POST /?action=admin-check — проверить пароль
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()

    try:
        # --- Проверка пароля админа ---
        if action == 'admin-check':
            if is_admin(event):
                return ok({'ok': True})
            return err('Неверный пароль', 403)

        # --- Комментарии: получить ---
        if action == 'comments':
            news_id = params.get('news_id')
            if not news_id:
                return err('news_id обязателен')
            cur.execute(
                "SELECT id, parent_id, author, text, is_admin, "
                "to_char(created_at, 'DD.MM.YYYY HH24:MI') FROM news_comments "
                f"WHERE news_id = {int(news_id)} ORDER BY created_at ASC"
            )
            rows = cur.fetchall()
            comments = [{'id': r[0], 'parent_id': r[1], 'author': r[2], 'text': r[3], 'is_admin': r[4], 'date': r[5]} for r in rows]
            return ok({'comments': comments})

        # --- Комментарии: добавить ---
        if action == 'comment' and method == 'POST':
            news_id = int(body.get('news_id') or 0)
            author = (body.get('author') or '').strip()[:100]
            text = (body.get('text') or '').strip()[:2000]
            parent_id = body.get('parent_id')
            admin = is_admin(event)

            if not news_id or not author or not text:
                return err('Заполните все поля')

            author_s = author.replace("'", "''")
            text_s = text.replace("'", "''")
            parent_sql = f"{int(parent_id)}" if parent_id else "NULL"
            cur.execute(
                f"INSERT INTO news_comments (news_id, parent_id, author, text, is_admin) "
                f"VALUES ({news_id}, {parent_sql}, '{author_s}', '{text_s}', {admin}) "
                f"RETURNING id, parent_id, author, text, is_admin, to_char(created_at, 'DD.MM.YYYY HH24:MI')"
            )
            r = cur.fetchone()
            conn.commit()
            return ok({'comment': {'id': r[0], 'parent_id': r[1], 'author': r[2], 'text': r[3], 'is_admin': r[4], 'date': r[5]}})

        # --- Комментарии: удалить (admin) ---
        if action == 'delete_comment':
            if not is_admin(event):
                return err('Нет доступа', 403)
            cid = int(params.get('id') or 0)
            if not cid:
                return err('id обязателен')
            cur.execute(f"UPDATE news_comments SET text = '[удалено]' WHERE id = {cid}")
            conn.commit()
            return ok({'ok': True})

        # --- Новость: удалить (admin) ---
        if action == 'delete_news':
            if not is_admin(event):
                return err('Нет доступа', 403)
            nid = int(params.get('id') or 0)
            if not nid:
                return err('id обязателен')
            cur.execute(f"UPDATE news_comments SET text = '[удалено]' WHERE news_id = {nid}")
            cur.execute(f"UPDATE news SET title = '[удалено]', body = '[удалено]' WHERE id = {nid}")
            conn.commit()
            return ok({'ok': True})

        # --- Новость: создать (admin) ---
        if action == 'create' and method == 'POST':
            if not is_admin(event):
                return err('Нет доступа', 403)
            title = (body.get('title') or '').strip()[:300]
            text = (body.get('body') or '').strip()
            tag = (body.get('tag') or 'Новость').strip()[:50]
            if not title or not text:
                return err('Заголовок и текст обязательны')
            title_s = title.replace("'", "''")
            text_s = text.replace("'", "''")
            tag_s = tag.replace("'", "''")
            cur.execute(
                f"INSERT INTO news (title, body, tag) VALUES ('{title_s}', '{text_s}', '{tag_s}') "
                f"RETURNING id, title, body, tag, to_char(created_at, 'DD.MM.YYYY')"
            )
            r = cur.fetchone()
            conn.commit()
            return ok({'news': {'id': r[0], 'title': r[1], 'body': r[2], 'tag': r[3], 'date': r[4]}})

        # --- Новости: список ---
        if method == 'GET':
            cur.execute(
                "SELECT id, title, body, tag, to_char(created_at, 'DD.MM.YYYY') FROM news "
                "WHERE title != '[удалено]' ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            news = [{'id': r[0], 'title': r[1], 'body': r[2], 'tag': r[3], 'date': r[4]} for r in rows]
            return ok({'news': news})

        return err('Method not allowed', 405)

    finally:
        cur.close()
        conn.close()
