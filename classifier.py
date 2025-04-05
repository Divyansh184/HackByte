# Paths to input and output files
input_file = r"C:\Users\Anshuman\Desktop\Hackathon\HackByte\DataFiles\KDD\kddcup.data_10_percent_corrected"
normal_file = r"C:\Users\Anshuman\Desktop\Hackathon\HackByte\DataFiles\normal.txt"
sus_file = r"C:\Users\Anshuman\Desktop\Hackathon\HackByte\DataFiles\sus.txt"

# Counters (optional but useful)
normal_count = 0
sus_count = 0

# Process the dataset and split it
with open(input_file, "r") as infile, \
     open(normal_file, "w") as normal_out, \
     open(sus_file, "w") as sus_out:
    
    for line in infile:
        line = line.strip()
        if not line:
            continue  # skip empty lines
        parts = line.split(',')
        label = parts[-1].strip().lower()

        if label == "normal.":
            normal_out.write(','.join(parts[:-1]) + '\n')
            normal_count += 1
        else:
            sus_out.write(','.join(parts[:-1]) + '\n')
            sus_count += 1
