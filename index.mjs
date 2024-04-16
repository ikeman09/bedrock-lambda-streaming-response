import {
	BedrockRuntimeClient,
	InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

export const handler = awslambda.streamifyResponse(
	async (requestStream, responseStream, context) => {
		const client = new BedrockRuntimeClient({
			region: "us-east-1",
		});

		const prompt = "Create me an article about amazon bedrock";
		const claudPrompt = `Human:${prompt} Assistant:`;

		const body = {
			prompt: claudPrompt,
			max_tokens_to_sample: 2048,
			temperature: 0.5,
			top_k: 250,
			top_p: 0.5,
			stop_sequences: [],
			anthropic_version: "bedrock-2023-05-31",
		};

		const params = {
			modelId: "anthropic.claude-v2",
			stream: true,
			contentType: "application/json",
			accept: "*/*",
			body: JSON.stringify(body),
		};

		console.log(params);

		const command = new InvokeModelWithResponseStreamCommand(params);

		const response = await client.send(command);
		const chunks = [];

		for await (const chunk of response.body) {
			const parsed = JSON.parse(
				Buffer.from(chunk.chunk.bytes, "base64").toString("utf-8")
			);
			chunks.push(parsed.completion);

			responseStream.write(parsed.completion);
		}

		console.log(chunks.join(""));
		responseStream.end();
	}
);
