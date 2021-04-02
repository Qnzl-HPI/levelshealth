## @hpi/levelshealth

### Installation

```bash
git clone git@github.com:Qnzl-HPI/levelshealth.git

# Install node requirements
npm install

# Install data access layer
pip3 install .

# Build the executables
npm run build

```

### Usage

Copy the built executables to /usr/bin or similar location. If you use /usr/local/bin instead, cron will not be able to run

Use crontab.guru to determine cron expression for your schedule. Every 7 days is recommended to have no overlaps. If you need more or less, you will need to modify the script in `bin/` to change the time window.


