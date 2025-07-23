// src/features/common/functions/requestWithAuthMode.ts

import { GraphQLClient } from "graphql-request";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

/**
 * GraphQLのリクエストをDEMOモード/認証モードで切り替えて実行するユーティリティ
 */
export async function requestWithAuthMode<
  TData,
  TVariables extends object | undefined = undefined
>(
  client: GraphQLClient,
  getAccessTokenSilently: () => Promise<string>,
  query: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables
): Promise<TData> {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return client.request(query, variables);
  } else {
    const token = await getAccessTokenSilently();
    return client.request(query, variables, { authorization: `Bearer ${token}` });
  }
}
