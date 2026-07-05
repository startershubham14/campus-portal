"""
S3 utilities — presigned URL generation.

Why presigned URLs: 
  The browser uploads directly to S3. Your FastAPI server never receives
  the file bytes — it only generates a short-lived signed URL that
  authorises one specific upload operation. This means:
    - No memory pressure on your server
    - No file size limits from FastAPI/nginx
    - Upload speed = user's connection to S3, not your server
    - Server just stores the final S3 URL in the DB
"""
import uuid
import boto3
from botocore.exceptions import ClientError

from app.config import settings

# One client instance shared across requests.
# boto3 clients are thread-safe and connection-pooled.
_s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def generate_presigned_upload_url(
    folder: str,
    filename: str,
    content_type: str,
    expires_in: int = 300,  # 5 minutes — enough for any upload
) -> tuple[str, str]:
    """
    Generate a presigned PUT URL for a single file upload.

    Returns (presigned_url, object_key).
      presigned_url — the browser PUT target. Valid for `expires_in` seconds.
      object_key    — the S3 key to store in the DB as the file reference.

    The key includes a UUID so two files with the same name don't collide:
      e.g. "materials/csc801/a3f8c1d2-week1-notes.pdf"
    """
    unique_id = uuid.uuid4().hex[:8]
    # Sanitise filename: replace spaces, keep extension
    safe_name = filename.replace(" ", "_")
    object_key = f"{folder}/{unique_id}-{safe_name}"

    try:
        presigned_url = _s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
            HttpMethod="PUT",
        )
    except ClientError as e:
        raise RuntimeError(f"Could not generate presigned URL: {e}") from e

    return presigned_url, object_key


def get_file_url(object_key: str) -> str:
    """
    Build the permanent public-style URL for a stored object.
    Since the bucket is private, we use a long-lived presigned GET URL
    (7 days) for viewing. For truly public files you'd set a bucket policy
    instead — but keeping the bucket private is safer for a campus portal.
    """
    try:
        return _s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": object_key},
            ExpiresIn=60 * 60 * 24 * 7,  # 7 days
        )
    except ClientError as e:
        raise RuntimeError(f"Could not generate view URL: {e}") from e


def delete_file(object_key: str) -> None:
    """Delete an object from S3. Called when faculty deletes a material."""
    try:
        _s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=object_key,
        )
    except ClientError as e:
        # Log but don't crash — DB record deletion proceeds regardless
        print(f"Warning: S3 delete failed for {object_key}: {e}")