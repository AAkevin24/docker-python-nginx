const apiUrl = '/api/users'; // O Nginx redireciona /api para o backend

// Função para carregar todos os usuários
async function loadUsers() {
    try {
        const response = await fetch(apiUrl);
        const users = await response.json();

        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.age}</td>
                <td>
                    <button onclick="editUser(${user.id}, '${user.name}', ${user.age})">Editar</button>
                    <button onclick="deleteUser(${user.id})">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Função para adicionar um novo usuário
document.querySelector('#createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const age = document.querySelector('#age').value;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, age })
        });

        const data = await response.json();

        if (response.ok) {
            document.querySelector('#message').textContent = data.message;
            document.querySelector('#name').value = '';
            document.querySelector('#age').value = '';
            loadUsers();
        } else {
            document.querySelector('#message').textContent = data.message;
        }
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
    }
});

// Função para editar um usuário
function editUser(id, name, age) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editAge').value = age;
    document.getElementById('editFormContainer').style.display = 'block';
    document.getElementById('createFormContainer').style.display = 'none';
    document.getElementById('message').textContent = '';
}

// Função para cancelar a edição
function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('createFormContainer').style.display = 'block';
    document.getElementById('editMessage').textContent = '';
}

// Função para salvar as alterações do usuário
document.querySelector('#editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editName').value;
    const age = document.getElementById('editAge').value;

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, age })
        });

        const data = await response.json();

        if (response.ok) {
            document.querySelector('#editMessage').textContent = data.message;
            cancelEdit();
            loadUsers();
        } else {
            document.querySelector('#editMessage').textContent = data.message;
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
    }
});

// Função para deletar um usuário
async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            loadUsers();
        } else {
            alert('Erro ao deletar usuário.');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
    }
}

// Carregar os usuários ao iniciar
loadUsers();
