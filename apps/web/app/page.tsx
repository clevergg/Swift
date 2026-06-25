import { redirect } from 'next/navigation';

// Главная страница. Пока редиректит на вход.
// В #16/#17 здесь будет проверка авторизации: авторизованного — на доски,
// иначе — на /login.
export default function HomePage() {
  redirect('/login');
}
