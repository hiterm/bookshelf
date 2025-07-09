import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy } from 'react';

// ルートコンポーネント
import App from './App';

// 各ページの遅延ロード
const BookIndexPage = lazy(() => import('./pages/books/BookIndexPage').then(m => ({ default: m.BookIndexPage })));
const BookDetailPage = lazy(() => import('./pages/books/BookDetailPage').then(m => ({ default: m.BookDetailPage })));
const BookDetailEditPage = lazy(() => import('./pages/books/BookDetailEditPage').then(m => ({ default: m.BookDetailEditPage })));
const AuthorIndexPage = lazy(() => import('./pages/authors/AuthorIndexPage').then(m => ({ default: m.AuthorIndexPage })));
const SignInScreen = lazy(() => import('./features/auth/SignInScreen').then(m => ({ default: m.SignInScreen })));

// ルート定義
const rootRoute = createRootRoute({
  component: App,
});


const booksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'books',
});

const booksIndexRoute = createRoute({
  getParentRoute: () => booksRoute,
  path: '/',
  component: BookIndexPage,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => booksRoute,
  path: '$id',
  component: BookDetailPage,
});

export const bookEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'books/$id/edit',
  component: BookDetailEditPage,
});

const authorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/authors',
  component: AuthorIndexPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignInScreen,
});

// ルーターインスタンス作成
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    bookEditRoute,
    booksRoute.addChildren([
      booksIndexRoute,
      bookDetailRoute,
    ]),
    authorsRoute,
    signInRoute,
  ]),
  defaultPreload: 'intent',
});

// 型の自動生成用
export type AppRouter = typeof router;
