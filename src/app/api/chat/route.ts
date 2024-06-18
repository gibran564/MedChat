import { NextRequest, NextResponse } from 'next/server';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const projectId = 'medchat-424418';
const region = 'us-central1';

if (!API_KEY) {
    throw new Error('API_KEY is not defined. Please set the ANTHROPIC_API_KEY environment variable.');
}

const client = new AnthropicVertex({
    projectId,
    region,
});

interface MessageContent {
    type: string;
    text: string;
}

interface AnthropicResponse {
    id: string;
    type: string;
    role: string;
    model: string;
    content: MessageContent[];
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        console.log("Received prompt:", prompt);

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Utiliza un nombre de modelo válido
        const result = await client.messages.create({
            model: 'claude-3-sonnet@20240229',
            max_tokens: 1500,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }) as unknown as AnthropicResponse;

        console.log("API response:", result);

        if (result.content && result.content.length > 0) {
            return NextResponse.json({ response: result.content[0].text });
        } else {
            return NextResponse.json({ error: 'No response from model' }, { status: 500 });
        }
    } catch (error: unknown) {
        console.error('Error interacting with Anthropic API:', error);

        if (isAnthropicError(error)) {
            return NextResponse.json({ error: error.response.data.error }, { status: 500 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function isAnthropicError(error: unknown): error is { response: { data: { error: string } } } {
    return typeof error === 'object' && error !== null && 'response' in error && 'data' in (error as any).response;
}
