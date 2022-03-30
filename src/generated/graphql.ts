import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Author = {
  __typename?: 'Author';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type CreateAuthorData = {
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAuthor: Author;
  registerUser: User;
};


export type MutationCreateAuthorArgs = {
  authorData: CreateAuthorData;
};

export type Query = {
  __typename?: 'Query';
  author: Author;
  authors: Array<Author>;
  loggedInUser: User;
};


export type QueryAuthorArgs = {
  id: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
};

export type AuthorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthorsQuery = { __typename?: 'Query', authors: Array<{ __typename?: 'Author', id: string, name: string }> };

export type CreateAuthorMutationVariables = Exact<{
  authorData: CreateAuthorData;
}>;


export type CreateAuthorMutation = { __typename?: 'Mutation', createAuthor: { __typename?: 'Author', id: string } };

export type LoggedInUserQueryVariables = Exact<{ [key: string]: never; }>;


export type LoggedInUserQuery = { __typename?: 'Query', loggedInUser: { __typename?: 'User', id: string } };

export type RegisterUserMutationVariables = Exact<{ [key: string]: never; }>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'User', id: string } };


export const AuthorsDocument = gql`
    query authors {
  authors {
    id
    name
  }
}
    `;

export function useAuthorsQuery(options?: Omit<Urql.UseQueryArgs<AuthorsQueryVariables>, 'query'>) {
  return Urql.useQuery<AuthorsQuery>({ query: AuthorsDocument, ...options });
};
export const CreateAuthorDocument = gql`
    mutation createAuthor($authorData: CreateAuthorData!) {
  createAuthor(authorData: $authorData) {
    id
  }
}
    `;

export function useCreateAuthorMutation() {
  return Urql.useMutation<CreateAuthorMutation, CreateAuthorMutationVariables>(CreateAuthorDocument);
};
export const LoggedInUserDocument = gql`
    query loggedInUser {
  loggedInUser {
    id
  }
}
    `;

export function useLoggedInUserQuery(options?: Omit<Urql.UseQueryArgs<LoggedInUserQueryVariables>, 'query'>) {
  return Urql.useQuery<LoggedInUserQuery>({ query: LoggedInUserDocument, ...options });
};
export const RegisterUserDocument = gql`
    mutation registerUser {
  registerUser {
    id
  }
}
    `;

export function useRegisterUserMutation() {
  return Urql.useMutation<RegisterUserMutation, RegisterUserMutationVariables>(RegisterUserDocument);
};