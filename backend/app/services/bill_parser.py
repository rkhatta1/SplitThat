from PIL import Image
import io
import google.generativeai as genai
import json
from typing import List
from pdf2image import convert_from_bytes

from app.core.config import settings
from app.models.schemas import BillSplitResponse

class MultimodalBillParser:
    """Uses a multimodal Gemini model to parse receipt images/PDFs and return structured JSON."""
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Use a model that supports multimodal inputs
        self._model = genai.GenerativeModel('gemini-2.5-flash')

    def _get_parsing_prompt(self, participants: List[str], user_prompt: str) -> str:
        # The prompt is now simpler as it doesn't need to be fed OCR text.
        # It instructs the model to look at the provided image(s).
        return f"""
            You are a bill-splitting assistant. Your task is to analyze the attached receipt image(s) and assign items, including tax and tip, to the people involved based on a user's instructions.

            **Context:**
            - Participants: {', '.join(participants)}
            - User's Instruction: "{user_prompt or 'Split everything equally among all participants.'}"

            **Your Task:**
            1. Analyze the attached image(s) of the receipt.
            2. Identify every individual item, its quantity, its status (e.g., shopped, weight-adjusted, cancelled), and its total price.
            3. Also, explicitly identify the **Tax** amount and the **Tip** amount if they are listed.
            4. Analyze the User's Instruction to assign each item, the Tax, and the Tip to the correct participant(s).
            5. You MUST respond ONLY with a single, valid JSON object that follows the schema provided below. Do not include any other text, explanations, or markdown formatting.

            **JSON Output Schema:**
            {BillSplitResponse.model_json_schema()}
        """

    def parse_bill_from_media(
        self, file_bytes: bytes, content_type: str, participants: List[str], user_prompt: str
    ) -> BillSplitResponse:
        
        images = []
        if content_type.startswith("image/"):
            images.append(Image.open(io.BytesIO(file_bytes)))
        elif content_type == "application/pdf":
            # Convert each page of the PDF to an image
            images.extend(convert_from_bytes(file_bytes))
        
        if not images:
            raise ValueError("Could not process the provided file. Ensure it is a valid image or PDF.")

        prompt = self._get_parsing_prompt(participants, user_prompt)
        
        # The model's input is a list containing the text prompt and all the images
        model_input = [prompt] + images

        try:
            response = self._model.generate_content(model_input)
            cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
            parsed_json = json.loads(cleaned_response_text)
            return BillSplitResponse(**parsed_json)
        except (json.JSONDecodeError, TypeError, KeyError) as e:
            print(f"Error parsing Gemini response: {e}")
            raise ValueError("Failed to get a valid structured response from the AI model.")
        except Exception as e:
            print(f"An unexpected error occurred with the Gemini API: {e}")
            raise

# --- Dependency Injection Setup ---
def get_multimodal_parser() -> MultimodalBillParser:
    return MultimodalBillParser(api_key=settings.google_api_key)