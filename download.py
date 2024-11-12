import subprocess
import sys
import os
import re

def download_m3u8_video(m3u8_url, outputfile):

    current_directory = os.path.dirname(os.path.abspath(__file__))
    downloads_directory = os.path.join(current_directory, 'Downloads')

    # Make sure the Downloads directory exists, create if not
    if not os.path.exists(downloads_directory):
        os.makedirs(downloads_directory)

    # Combine the output file name with the Downloads directory path
    outputfile_path = os.path.join(downloads_directory, outputfile)

    print("Starting Download ...")
    # Use subprocess to run Streamlink command
    process = subprocess.Popen(
        ["streamlink", m3u8_url, "worst", "-o", outputfile_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Regex pattern to match the download progress
    progress_pattern = re.compile(r"(\d+)% of (\d+)")

    # Continuously read the output from streamlink
    while True:
        stdout_line = process.stdout.readline()
        if stdout_line == '' and process.poll() is not None:
            break
        if stdout_line:
            # Print the output to the terminal
            print(stdout_line.strip())

            # Look for download progress
            match = progress_pattern.search(stdout_line)
            if match:
                # Extract percentage and total bytes
                percentage = match.group(1)
                total = match.group(2)
                print(f"Download Progress: {percentage}% of {total} bytes")

    # Wait for the process to finish and capture any errors
    stdout, stderr = process.communicate()

    if process.returncode == 0:
        print(f"Download complete!")
    else:
        print(f"Error occurred:\n{stderr.decode('utf-8')}")

# Get URL and output file from command line arguments
if __name__ == "__main__":
    m3u8_url = sys.argv[1]  # First argument is M3U8 URL
    outputfile = sys.argv[2]  # Second argument is the output file name
    download_m3u8_video(m3u8_url, outputfile)
