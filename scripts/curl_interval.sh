#!/bin/bash

# Help screen function
show_help() {
  cat << 'EOF'
Usage: curl_interval <url> <interval_ms> [duration_ms]

Arguments:
  <url>           The URL to curl
  <interval_ms>   Interval between curls in milliseconds
  [duration_ms]   Optional: Total duration in milliseconds (0 or omitted = run indefinitely)

Examples:
  curl_interval https://example.com 1000           # Curl every 1 second, indefinitely
  curl_interval https://example.com 1000 5000      # Curl every 1 second for 5 seconds total
  curl_interval https://example.com 500 10000      # Curl every 500ms for 10 seconds

EOF
}

# check if no arguments provided
if [[ $# -eq 0 ]]; then
  show_help
  exit 0
fi

URL="$1"
INTERVAL_MS="$2"
DURATION_MS="${3:-0}"

# error handling for missing required args
if [[ -z "$URL" ]]; then
  echo "Error: URL is required" >&2
  show_help
  exit 1
fi

if [[ -z "$INTERVAL_MS" ]]; then
  echo "Error: Interval in milliseconds is required" >&2
  show_help
  exit 1
fi

# validate that interval and duration are numbers
if ! [[ "$INTERVAL_MS" =~ ^[0-9]+$ ]]; then
  echo "Error: Interval must be a positive integer (milliseconds)" >&2
  exit 1
fi

if ! [[ "$DURATION_MS" =~ ^[0-9]*$ ]]; then
  echo "Error: Duration must be a positive integer (milliseconds)" >&2
  exit 1
fi

INTERVAL_SEC=$(echo "scale=3; $INTERVAL_MS / 1000" | bc)
COUNT=0

if [[ "$DURATION_MS" -eq 0 ]]; then
  # run indefinitely
  while true; do
    COUNT=$((COUNT + 1))
    echo -e "\n--- [#$COUNT] ---\n"
    curl -I "$URL"
    sleep "$INTERVAL_SEC"
  done
else
  # run for specified duration
  START_TIME=$(date +%s)
  DURATION_SEC=$(echo "scale=3; $DURATION_MS / 1000" | bc)
  END_TIME=$((START_TIME + DURATION_SEC))

  while [[ $(date +%s) -lt $END_TIME ]]; do
    COUNT=$((COUNT + 1))
    echo -e "\n--- [#$COUNT] ---\n"
    curl "$URL"
    sleep "$INTERVAL_SEC"
  done
fi