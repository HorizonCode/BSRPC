# BSRPC - Beat Saber Discord Presence

This program allows you to display your current Beat Saber gameplay status on Discord using the Streamer Tools Mod for the Quest version of Beat Saber.

## Requirements

- Node.js 20 and above
- Beat Saber 1.28.x
- Beat Saber Streamer Tools Mod installed on your Oculus Quest
- Discord account
- Local network IP address of your Oculus Quest

## Installation

1. Clone or download this repository to your local machine.
2. Navigate to the directory where you downloaded the repository.
3. Install the necessary Node.js packages by running:
   ```
   npm install
   ```
4. Inside the `.env` file, add your Oculus Quest's local network IP address in the following format:
   ```
   QUEST_IP=YOUR_QUEST_IP_ADDRESS
   ```
   Replace `YOUR_QUEST_IP_ADDRESS` with the actual IP address of your Oculus Quest.
6. Save the `.env` file.

## Usage

1. Make sure your Oculus Quest is connected to the same local network as your computer.
2. Start Beat Saber on your Oculus Quest.
3. Start the Discord presence program by running:
   ```
   npm start
   ```
4. The program will now connect to Beat Saber and Discord, and your Beat Saber gameplay status will be displayed on Discord.

## Troubleshooting

- If the program fails to connect to Beat Saber or Discord, double-check your `.env` file for any typos in the IP address.
- Ensure that your Oculus Quest is connected to the same local network as your computer and that the Streamer Tools Mod is running in Beat Saber.

## Credits

This program utilizes the Streamer Tools Mod for Beat Saber created by EnderdracheLP. Without their efforts, this project would not be possible.