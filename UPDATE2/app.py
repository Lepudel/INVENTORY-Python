from flask import Flask, request, jsonify, render_template
from googleapiclient.discovery import build

# Создаем Flask приложение
app = Flask(__name__)

# Параметры Google Sheets
SPREADSHEET_ID = '17vAx26XcUJEJ8POW6zwJ-oUHGK0uoNF5PlYuXwFgdsU'
RANGE = 'Sheet1!A2:H'

# Настройка Google API с использованием API-ключа
API_KEY = 'AIzaSyAmdSOhE9WOqh75rFdRE9lZdzZRyXhNWCc'
service = build('sheets', 'v4', developerKey=API_KEY)

# Эндпоинт для корневого URL
@app.route('/')
def index():
    return render_template('index.html')

# Эндпоинт для получения данных из Google Sheets
@app.route('/products', methods=['GET'])
def get_products():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE).execute()
        rows = result.get('values', [])

        # Преобразуем данные в удобный формат
        products = []
        for i, row in enumerate(rows, start=2):
            id = int(row[0]) if len(row) > 0 and row[0].isdigit() else i
            name = row[1] if len(row) > 1 else ''
            description = row[2] if len(row) > 2 else ''
            quantity = int(row[3]) if len(row) > 3 and row[3].isdigit() else 0
            image_urls = row[4].split(',') if len(row) > 4 and row[4] else []
            category = row[5] if len(row) > 5 else ''
            quantity_available = int(row[7]) if len(row) > 7 and row[7].isdigit() else quantity

            products.append({
                'id': id,
                'name': name,
                'description': description,
                'quantity': quantity,
                'imageURLs': image_urls,
                'category': category,
                'quantityAvailable': quantity_available
            })

        return jsonify(products)
    except Exception as e:
        print(f'Ошибка при получении данных: {e}')
        return jsonify({'error': 'Не удалось получить данные из Google Sheets'}), 500

# Эндпоинт для обновления остатков на складе
@app.route('/updateInventory', methods=['POST'])
def update_inventory():
    return jsonify({'error': 'Обновление данных через API-ключ не поддерживается'}), 501

# Запуск приложения
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)