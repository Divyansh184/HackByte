import argparse

def filter_non_normal_records(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
        for line in infile:
            line = line.strip()
            if not line:
                continue
            if not line.endswith('normal.'):
                outfile.write(line + '\n')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_file', default=r'C:\Users\ABCD\Desktop\HackByte\HackByte\DataFiles\KDD\kddcup.data_10_percent_corrected', help='Path to the input file with data records')
    parser.add_argument('--output_file', default='suspicious_records.txt', help='Output file to save non-normal records')
    args = parser.parse_args()

    filter_non_normal_records(args.input_file, args.output_file)
    print(f"Filtered non-normal records written to: {args.output_file}")
