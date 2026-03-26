#!/bin/bash
#
# Featurebase Webhook Test Script
#
# Usage:
#   ./test-webhooks.sh <number>
#
#   1 = post.created
#   2 = post.updated
#   3 = post.status_changed
#   4 = comment.created
#   5 = changelog.published
#   all = run all 5 tests
#
# HOW TO USE:
#   1. Open the trigger node in n8n and click "Listen for test event"
#   2. Run: ./test-webhooks.sh <number>
#   (Test mode only listens for one call at a time)

URLS=(
    [1]="http://localhost:5678/webhook-test/fb-trg-1/webhook"
    [2]="http://localhost:5678/webhook-test/fb-trg-2/webhook"
    [3]="http://localhost:5678/webhook-test/fb-trg-3/webhook"
    [4]="http://localhost:5678/webhook-test/fb-trg-4/webhook"
    [5]="http://localhost:5678/webhook-test/fb-trg-5/webhook"
)

send() {
    local label="$1"
    local url="$2"
    local payload="$3"

    echo ""
    echo "━━━ $label ━━━"
    echo "POST $url"
    echo ""

    RESPONSE=$(curl -s -w "\nHTTP %{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$payload")

    echo "$RESPONSE"
    echo ""
}

test_post_created() {
    send "post.created" "${URLS[1]}" '{
  "event": "post.created",
  "data": {
    "id": "post_abc123",
    "title": "Add dark mode support",
    "content": "<p>It would be great to have a dark mode option.</p>",
    "boardId": "board_xyz",
    "boardName": "Feature Requests",
    "status": "open",
    "tags": ["ui", "accessibility"],
    "votes": 0,
    "authorEmail": "user@example.com",
    "url": "https://feedback.example.com/p/add-dark-mode-support",
    "createdAt": "2026-03-26T10:00:00.000Z"
  }
}'
}

test_post_updated() {
    send "post.updated" "${URLS[2]}" '{
  "event": "post.updated",
  "data": {
    "id": "post_abc123",
    "title": "Add dark mode support (updated)",
    "content": "<p>Updated description with more details about dark mode.</p>",
    "boardId": "board_xyz",
    "boardName": "Feature Requests",
    "status": "open",
    "tags": ["ui", "accessibility", "design"],
    "votes": 12,
    "url": "https://feedback.example.com/p/add-dark-mode-support",
    "updatedAt": "2026-03-26T11:30:00.000Z"
  }
}'
}

test_post_status_changed() {
    send "post.status_changed" "${URLS[3]}" '{
  "event": "post.status_changed",
  "data": {
    "id": "post_abc123",
    "title": "Add dark mode support",
    "boardId": "board_xyz",
    "boardName": "Feature Requests",
    "previousStatus": "open",
    "status": "in_progress",
    "tags": ["ui", "accessibility"],
    "votes": 42,
    "url": "https://feedback.example.com/p/add-dark-mode-support",
    "changedAt": "2026-03-26T14:00:00.000Z"
  }
}'
}

test_comment_created() {
    send "comment.created" "${URLS[4]}" '{
  "event": "comment.created",
  "data": {
    "id": "comment_def456",
    "postId": "post_abc123",
    "postTitle": "Add dark mode support",
    "content": "<p>We are starting work on this next sprint!</p>",
    "authorEmail": "admin@example.com",
    "authorName": "Product Manager",
    "isPrivate": false,
    "createdAt": "2026-03-26T15:00:00.000Z"
  }
}'
}

test_changelog_published() {
    send "changelog.published" "${URLS[5]}" '{
  "event": "changelog.published",
  "data": {
    "id": "changelog_ghi789",
    "title": "March 2026 Release — Dark Mode & More",
    "content": "<h2>New Features</h2><ul><li>Dark mode support</li><li>Improved search</li></ul>",
    "tags": ["new", "improvement"],
    "published": true,
    "url": "https://feedback.example.com/changelog/march-2026-release",
    "publishedAt": "2026-03-26T16:00:00.000Z"
  }
}'
}

case "${1:-}" in
1)   test_post_created ;;
2)   test_post_updated ;;
3)   test_post_status_changed ;;
4)   test_comment_created ;;
5)   test_changelog_published ;;
all)
    test_post_created
    test_post_updated
    test_post_status_changed
    test_comment_created
    test_changelog_published
    ;;
*)
    echo "Featurebase Webhook Test Script"
    echo ""
    echo "Usage: ./test-webhooks.sh <number>"
    echo ""
    echo "  1    post.created"
    echo "  2    post.updated"
    echo "  3    post.status_changed"
    echo "  4    comment.created"
    echo "  5    changelog.published"
    echo "  all  run all 5 tests"
    echo ""
    echo "Open the trigger node in n8n, click 'Listen for test event', then run the script."
    echo ""
    ;;
esac
