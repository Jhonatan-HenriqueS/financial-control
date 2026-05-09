// Formato de um usuario salvo no localStorage.
// Todo cadastro precisa virar um objeto com estes tres campos.
export interface User {
  name: string;
  email: string;
  password: string;
}

// Dados que a tela de login envia para validacao.
// identifier aceita email ou nome de usuario.
export interface LoginCredentials {
  identifier: string;
  password: string;
}
