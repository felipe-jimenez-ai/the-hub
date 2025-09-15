import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import axios from 'axios'; // Import axios for HTTP requests

export async function POST(req: NextRequest) {
  const { profileUrl } = await req.json();

  if (!profileUrl) {
    return NextResponse.json({ error: 'profileUrl is required' }, { status: 400 });
  }

  let scrapedText = '';
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body', { timeout: 10000 });
    scrapedText = await page.evaluate(() => document.body.innerText);
    await browser.close();
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to scrape LinkedIn profile: ${e.message}` }, { status: 500 });
  }

  if (!scrapedText) {
    console.error("Scraped content is empty.");
    return NextResponse.json({ error: 'Scraped content is empty.' }, { status: 500 });
  }

  console.log("Scraped Text Length:", scrapedText.length);
  console.log("First 500 chars of Scraped Text:\n", scrapedText.substring(0, 500));

  const systemPrompt = `You are an expert at summarizing professional profiles. Based on the following LinkedIn profile text, generate a JSON object with three keys: summary (a concise, one-paragraph summary of this person\'s professional identity), canHelpWith (a bulleted list of 3-4 specific skills or areas of expertise), and isLookingFor (a bulleted list of 3-4 things this person is likely seeking, such as collaborations or advice). Ensure your entire response is only the raw JSON object, with no extra formatting or commentary.`;

  try {
    const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'gemma2-9b-it',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: scrapedText }],
      response_format: { type: 'json_object' },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Raw Groq API Response:", JSON.stringify(groqResponse.data, null, 2));
    const llmContent = groqResponse.data.choices[0]?.message?.content;

    if (!llmContent) {
      console.error("LLM response content is empty or undefined.");
      return NextResponse.json({ error: 'LLM response content is empty.' }, { status: 500 });
    }

    console.log("LLM Raw Content to Parse:", llmContent);
    const llmResponse = JSON.parse(llmContent);
    return NextResponse.json(llmResponse);
  } catch (e: any) {
    console.error("Error during LLM interaction or parsing:", e.message);
    if (axios.isAxiosError(e) && e.response) {
      console.error("Groq API Error Response Data:", e.response.data);
      console.error("Groq API Error Status:", e.response.status);
    }
    return NextResponse.json({ error: `Failed to get or parse LLM response: ${e.message}` }, { status: 500 });
  }
}
