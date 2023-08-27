import subprocess
import statistics
import time
from concurrent.futures import ThreadPoolExecutor
import argparse
import logging


class CurlBenchmark:
    def __init__(self, curl_command: str, num_requests: int, num_parallel: int):
        self.curl_command = curl_command
        logging.info(f"Curl command: {curl_command}")
        self.num_requests = num_requests
        logging.info(f"Number of requests: {num_requests}")
        self.num_parallel = num_parallel
        logging.info(f"Number of parallel requests: {num_parallel}")
        self.timings = []

    def run_curl(self):
        start_time = time.time()
        result = subprocess.run(
            self.curl_command, capture_output=True, text=True, shell=True
        )
        end_time = time.time()

        if result.returncode == 0:
            time_taken = end_time - start_time
            self.timings.append(time_taken)
            logging.info(f"Request time: {time_taken:.4f} seconds")

    def benchmark(self):
        with ThreadPoolExecutor(max_workers=self.num_parallel) as executor:
            for _ in range(self.num_requests):
                executor.submit(self.run_curl)

        if self.timings:
            average_time = statistics.mean(self.timings)
            min_time = min(self.timings)
            max_time = max(self.timings)
            std_dev = statistics.stdev(self.timings)

            logging.info(f"Average time taken per request: {average_time:.4f} seconds")
            logging.info(f"Minimum time taken: {min_time:.4f} seconds")
            logging.info(f"Maximum time taken: {max_time:.4f} seconds")
            logging.info(f"Standard deviation: {std_dev:.4f} seconds")


def main():
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    parser = argparse.ArgumentParser(description="Benchmark curl requests.")
    parser.add_argument("--curl_command", required=True, help="Full curl command")
    parser.add_argument(
        "--requests", type=int, default=10, help="Number of requests to perform"
    )
    parser.add_argument(
        "--parallel", type=int, default=1, help="Number of parallel requests"
    )
    args = parser.parse_args()

    benchmark = CurlBenchmark(args.curl_command, args.requests, args.parallel)
    logging.info("Benchmarking...")
    benchmark.benchmark()


if __name__ == "__main__":
    main()
