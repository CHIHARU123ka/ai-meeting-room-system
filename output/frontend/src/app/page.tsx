'use client'

import { Layout } from '@/components/layout/Layout'
import { TodoContainer } from '@/components/todo/TodoContainer'

export default function HomePage() {
  return (
    <Layout>
      <TodoContainer />
    </Layout>
  )
}
