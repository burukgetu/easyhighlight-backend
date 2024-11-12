const { spawn } = require('child_process');
const path = require('path');

// Function to download video using the Python script
function downloadVideo(m3u8Url, outputFile) {
    return new Promise((resolve, reject) => {
        // Spawn the Python process
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'download.py'),  // Path to your Python script
            m3u8Url,  // First argument: M3U8 URL
            outputFile,  // Second argument: output file name
        ]);

        // Capture the standard output and error
        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data.toString()}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data.toString()}`);
        });

        // Handle process exit
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(`Download completed: ${outputFile}`);
            } else {
                reject(`Download failed with exit code ${code}`);
            }
        });
    });
}

// Example usage
// const m3u8Url = 'https://iiyg.upfootvid.com/UpFiles/2024/11/5/51/291064/0.m3u8';
// const outputFile = 'downloaded_video.mp4';

// downloadVideo(m3u8Url, outputFile)
//     .then((message) => console.log(message))
//     .catch((error) => console.error(error));

module.exports = downloadVideo