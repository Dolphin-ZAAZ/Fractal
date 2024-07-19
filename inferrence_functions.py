import openai
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import anthropic
import os
import pandas as pd
from sklearn.metrics.pairwise import euclidean_distances

model_base_prompt = "You are a kind, enthusiastic and helpful robot and your name is Mobsy. You know the following information from your memory algorithm: "

model_endpoints = {
    "GPT 3.5": "gpt-3.5-turbo-0125",
    "GPT 4": "gpt-4o",
    "GPT 4 Mini" : "gpt-4o-mini",
    "Mistral 7B": "open-mistral-7b",
    "Mixtral 8x7B": "open-mixtral-8x7b",
    "Mixtral 8x22B": "open-mixtral-8x22b",
    "Mistral Small": "mistral-small-latest",
    "Mistral Large": "mistral-large-latest",
    "Codestral": "codestral-latest",
    "Claude 3 Opus": "claude-3-opus-20240229"
}

main_model = "gpt-4o-mini"
functional_model = "gpt-4o-mini"
tools_model = "gpt-4o-mini"

def set_client(model):
    global client
    if model == "gpt-3.5-turbo-0125" or model == "gpt-4o" or model == "gpt-4o-mini":
        openai.api_key = os.getenv('OPENAI_API_KEY')
        client = openai.OpenAI()
    elif model == "open-mistral-7b" or model == "open-mixtral-8x7b" or model == "open-mixtral-8x22b" or model == "mistral-small-latest" or model == "mistral-large-latest":
        client = MistralClient(api_key=os.environ["MISTRAL_API_KEY"])
    elif model == "claude-3-opus-20240229":
        client = anthropic.Anthropic()
        
def get_functional_inference(model, system_message, user_message, length=500):
    if model == "gpt-3.5-turbo-0125" or model == "gpt-4o" or model == "gpt-4o-mini":
        api_type = "openai"
    if model == "open-mistral-7b" or model == "open-mixtral-8x7b" or model == "open-mixtral-8x22b" or model == "mistral-small-latest" or model == "mistral-large-latest":
        api_type = "mistral"
    if model == "claude-3-opus-20240229":
        api_type = "anthropic"
    if api_type == "openai":
        set_client(model)
        response = client.chat.completions.create(
            model=model,
            max_tokens=length,
            temperature=0.8,            
            messages=[{"role": "system", "content": system_message}, {"role": "user", "content": user_message}],
        )
        return response.choices[0].message.content
    elif api_type == "mistral":
        set_client(model)
        response = client.chat(
            model=model,
            max_tokens=length,
            temperature=0.8,
            messages=[ChatMessage(role= "system", content=system_message),
            ChatMessage(role="user", content=user_message)]
        )
        return response.choices[0].message.content
    elif api_type == "anthropic":
        response = client.messages.create(
            model=model,
            max_tokens=length,
            system=system_message,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text

def get_ai_response(message, model, preprompt):
    set_client(model)
    if model == "gpt-3.5-turbo-0125" or model == "gpt-4o" or model == "gpt-4o-mini":
        api_type = "openai"
    if model == "open-mistral-7b" or model == "open-mixtral-8x7b" or model == "open-mixtral-8x22b" or model == "mistral-small-latest" or model == "mistral-large-latest":
        api_type = "mistral"
    if model == "claude-3-opus-20240229":
        api_type = "anthropic"
    if api_type == "openai":
        response = client.chat.completions.create(
            model=model,
            max_tokens=4000,
            temperature=0.8,
            messages=[{"role": "system", "content": model_base_prompt + preprompt}
            ] + [{"role": "user", "content": message}],
        )
        formatted_response = f"AI: {response.choices[0].message.content}\n"
    elif api_type == "mistral":
        response = client.chat(
            model=model,
            max_tokens=4000,
            temperature=0.8,            
            messages=[ChatMessage(role= "system", content=model_base_prompt + preprompt)
            ] + [ChatMessage(role="user", content=message)],
        )
        formatted_response = f"AI: {response.choices[0].message.content}\n"
    elif api_type == "anthropic":
        response = client.messages.create(
            model=model,
            max_tokens=4000,
            system=model_base_prompt + preprompt,
            messages=[{"role": "user", "content": message}],
        )
        formatted_response = f"AI: {response.content[0].text}\n"
    return formatted_response

def get_full_ai_response(messages, prompt, model, preprompt):
    set_client(model)
    if model == "gpt-3.5-turbo-0125" or model == "gpt-4o" or model == "gpt-4o-mini":
        api_type = "openai"
    if model == "open-mistral-7b" or model == "open-mixtral-8x7b" or model == "open-mixtral-8x22b" or model == "mistral-small-latest" or model == "mistral-large-latest":
        api_type = "mistral"
    if model == "claude-3-opus-20240229":
        api_type = "anthropic"
    if api_type == "openai":
        response = client.chat.completions.create(
            model=model,
            max_tokens=4000,
            temperature=0.8,
            messages=[{"role" : "system", "content" : preprompt}] + messages + [{"role": "user", "content": prompt}],
        )
        formatted_response = f"AI: {response.choices[0].message.content}\n"
    elif api_type == "mistral":
        response = client.chat(
            model=model,
            max_tokens=4000,
            temperature=0.8,            
            messages=[ChatMessage(role= "system", content=preprompt)
            ] + make_mistral_chatmessages(messages) + [ChatMessage(role="user", content=prompt)]
        )
        formatted_response = f"AI: {response.choices[0].message.content}\n"
    return formatted_response

def make_tool(function_name, description, parameters = {'summary' : {'name': 'summary', 'type': 'string', 'description': 'a summary.', 'required': True}}, uses_enum=False):
    tools_construction = [{}]
    tools_construction[0]["type"] = "function"
    tools_construction[0]["function"] = {}
    tools_construction[0]["function"]["name"] = function_name
    tools_construction[0]["function"]["description"] = description
    tools_construction[0]["function"]["parameters"] = {"type": "object", "properties": {}, "required": []}
    for parameter_name, parameter_info in parameters.items():
        if uses_enum:
            tools_construction[0]["function"]["parameters"]["properties"][parameter_name] = {"type": parameter_info['type'], "description": parameter_info['description'], "enum": parameter_info['enum']}
        else:
            tools_construction[0]["function"]["parameters"]["properties"][parameter_name] = {"type": parameter_info['type'], "description": parameter_info['description']}
        if 'required' in parameter_info and parameter_info['required']:
            tools_construction[0]["function"]["parameters"]["required"].append(parameter_name)
    return tools_construction

def get_tool_inference(model, messages, tools, tool_choice):
    set_client(model)
    if model == "gpt-3.5-turbo-0125" or model == "gpt-4o" or model == "gpt-4o-mini":
        api_type = "openai"
    if model == "open-mistral-7b" or model == "open-mixtral-8x7b" or model == "open-mixtral-8x22b" or model == "mistral-small-latest" or model == "mistral-large-latest":
        api_type = "mistral"
        if tool_choice == 'required':
            tool_choice = 'any'
    if model == "claude-3-opus-20240229":
        api_type = "anthropic"
    if api_type == "openai":
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.8,
            tools=tools,
            tool_choice=tool_choice
        )
        return response.choices[0].message.tool_calls[0]
    elif api_type == "mistral":
        mistral_messages = make_mistral_chatmessages(messages)
        mistral_messages.append(ChatMessage(role="user", content="execute the tool"))
        response = client.chat(
            model=model,
            messages=mistral_messages,
            temperature=0.8,
            tools=tools,
            tool_choice=tool_choice
        )
        tool_call = response.choices[0].message.tool_calls[0]
        return tool_call

def get_post_tool_info(id, function_name, content):
    return {
                    "tool_call_id": id,
                    "role": "tool",
                    "name": function_name,
                    "content": content,
                }

def make_mistral_chatmessages(messages):
    mistral_messages = []
    for message in messages:
        mistral_message = ChatMessage(role=message["role"], content=message["content"])
        mistral_messages.append(mistral_message)
    return mistral_messages

def make_embedding(text):
    response = MistralClient(api_key=os.environ["MISTRAL_API_KEY"]).embeddings(
        model="mistral-embed",
        input=text,
    )
    return response.data[0].embedding

# search function
def rank_texts_with_embeddings(
    query: str,
    df: pd.DataFrame,
    text: str,
    embedding: str,
    top_n: int
) -> tuple[list[str], list[float]]:
    """Returns a list of strings and relatednesses, sorted from most related to least."""
    client = MistralClient(api_key=os.environ["MISTRAL_API_KEY"])
    query_embedding_response = client.embeddings(
        model="mistral-embed",
        input=query,
    )
    query_embedding = query_embedding_response.data[0].embedding
    sentences = df[text].tolist()
    distances = []
    embeddings = df[embedding].tolist()
    for text, embeddings in zip(sentences, embeddings):
        distance = euclidean_distances([embeddings], [query_embedding])
        distances.append(distance[0][0])
    
    sorted_indices = sorted(range(len(distances)), key=lambda k: distances[k])
    sorted_sentences = [sentences[i] for i in sorted_indices]
    sorted_distances = [distances[i] for i in sorted_indices]
    
    return sorted_sentences[:top_n], sorted_distances[:top_n]

def rank_multiple_embeddings(
    query: str,
    text: list[str],
    embeddings: list[str],
    top_n: int
    ):
    df = pd.DataFrame({
        'Text': text,
        'Embedding': embeddings
    })

    # Call the function
    closest_texts, distances = rank_texts_with_embeddings(query, df, 'Text', 'Embedding', top_n)
    return closest_texts, distances