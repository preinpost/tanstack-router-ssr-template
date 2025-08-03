import express from 'express';

// src/entry-server.tsx
import {
  createRequestHandler,
  renderRouterToString,
  RouterServer,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export async function render({
  req,
  res,
  head,
}: {
  req: express.Request
  res: express.Response
  head: string,
}) {
  // const handler = createRequestHandler({ request, createRouter })
  const url = new URL(req.originalUrl || req.url, 'https://localhost:3000').href
  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        headers.set(key, value as any)
      }
      return headers
    })(),
  })

  const handler = createRequestHandler({
    request,
    createRouter: () => {
      const router = createRouter()

      // Update each router instance with the head info from vite
      router.update({
        context: {
          ...router.options.context,
          head: head,
        },
      })
      return router
    },
  })

  return await handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )

  // return handler(({ request, responseHeaders, router }) =>
  //   renderRouterToString({
  //     responseHeaders,
  //     router,
  //     children: <RouterServer router={router} />,
  //   }),
  // )
}