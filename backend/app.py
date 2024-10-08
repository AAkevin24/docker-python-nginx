from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

# Função para ler a senha do banco de dados a partir dos Docker secrets
def read_secret(secret_name):
    try:
        with open(f'/run/secrets/{secret_name}', 'r') as file:
            return file.read().strip()
    except Exception as e:
        print(f'Erro ao ler o secret {secret_name}:', e)
        return ''

# Configuração da conexão com o banco de dados usando variáveis de ambiente e secrets
db_config = {
    'host': os.environ.get('DB_HOST'),           # Nome do host do banco de dados
    'user': os.environ.get('DB_USER'),         # Usuário do banco de dados
    'password': read_secret('mysql_root_password'),         # Senha lida do Docker secret
    'database': os.environ.get('DB_NAME')   # Nome do banco de dados
}

# Função para conectar ao banco de dados
def get_db_connection():
    return mysql.connector.connect(**db_config)

# Função para criar a tabela users se ela não existir
def create_users_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            age INT
        )
    ''')
    conn.commit()
    conn.close()

# Rota para listar todos os usuários (GET)
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()
    return jsonify(users)

# Rota para criar um novo usuário (POST)
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    name = data.get('name')
    age = data.get('age')

    if not name or not age:
        return jsonify({'message': 'Nome e idade são obrigatórios.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (name, age) VALUES (%s, %s)', (name, age))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Usuário criado com sucesso!'}), 201

# Rota para atualizar um usuário existente (PUT)
@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json
    name = data.get('name')
    age = data.get('age')

    if not name or not age:
        return jsonify({'message': 'Nome e idade são obrigatórios.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET name = %s, age = %s WHERE id = %s', (name, age, id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Usuário atualizado com sucesso!'})

# Rota para deletar um usuário (DELETE)
@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM users WHERE id = %s', (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Usuário deletado com sucesso!'})

# Inicializa o servidor web e cria a tabela de usuários se necessário
if __name__ == '__main__':
    create_users_table()
    app.run(host='0.0.0.0', port=5000)
