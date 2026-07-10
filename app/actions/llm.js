'use server'


export async function analyzeGoals(journals, goals) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity assistant. Analyze the provided journal entries against the user\'s goals. For each goal, determine if it was completed based on the journal content. Respond ONLY with a JSON object where keys are goal IDs and values are booleans indicating completion.'
          },
          {
            role: 'user',
            content: `Journals: ${JSON.stringify(journals)}\n\nGoals: ${JSON.stringify(goals)}`
          }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text)
    }

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('Goal analysis error:', error)
    return null
  }
}