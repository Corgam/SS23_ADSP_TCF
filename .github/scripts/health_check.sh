#!/bin/bash

MAX_RETRIES=3
SLEEP_SECONDS=5

attempt=1
while [[ $attempt -le $MAX_RETRIES ]]; do        
    if [[ $(curl -s $ROUTE) == '{"status":"healthy"}' ]]; then
        echo "Health check passed"
        exit 0
    fi
    
    echo "Health check failed, retrying in $SLEEP_SECONDS seconds..."
    sleep $SLEEP_SECONDS
    
    attempt=$((attempt + 1))
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1
