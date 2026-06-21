import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    '''
    Business: Получение списка отзывов и добавление новых отзывов посетителей базы отдыха.
    Args: event - dict с httpMethod, body; context - объект с request_id.
    Returns: HTTP-ответ со списком отзывов или результатом добавления.
    '''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            "SELECT id, name, rating, text, to_char(created_at, 'DD.MM.YYYY') "
            "FROM reviews ORDER BY created_at DESC LIMIT 50"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reviews = [
            {'id': r[0], 'name': r[1], 'rating': r[2], 'text': r[3], 'date': r[4]}
            for r in rows
        ]
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'reviews': reviews}),
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or '').strip()[:100]
        text = (body.get('text') or '').strip()[:2000]
        rating = int(body.get('rating') or 5)
        if rating < 1 or rating > 5:
            rating = 5

        if not name or not text:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Заполните имя и текст отзыва'}),
            }

        name_safe = name.replace("'", "''")
        text_safe = text.replace("'", "''")
        cur.execute(
            "INSERT INTO reviews (name, rating, text) "
            f"VALUES ('{name_safe}', {rating}, '{text_safe}') "
            "RETURNING id, name, rating, text, to_char(created_at, 'DD.MM.YYYY')"
        )
        r = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'review': {'id': r[0], 'name': r[1], 'rating': r[2], 'text': r[3], 'date': r[4]}
            }),
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}),
    }
