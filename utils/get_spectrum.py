import pandas as pd
import argparse
import matplotlib.pyplot as plt
import numpy as np


def keep_lowest_line(input_csv, output_csv, plot_output=None, x_col=0, y_col=1,
                     has_header=False, n_bins=None):
    """
    Read a CSV with x,y pairs, discard y < 0,
    bin x values into N equal-width bins, keep only the lowest y per bin.
    """
    header = 0 if has_header else None
    df = pd.read_csv(input_csv, header=header)

    # Pick columns by index or name
    x_series = df.iloc[:, x_col] if isinstance(x_col, int) else df[x_col]
    y_series = df.iloc[:, y_col] if isinstance(y_col, int) else df[y_col]

    temp = pd.DataFrame({"x": x_series, "y": y_series})

    # Store original data for plotting all points
    original_count = len(temp)

    # Bin x values if n_bins specified
    if n_bins is not None and n_bins > 0:
        x_min, x_max = temp["x"].min(), temp["x"].max()

        # Create bin edges
        bin_edges = np.linspace(x_min, x_max, n_bins + 1)

        # Assign each row to a bin (bin numbers 0 to n_bins-1)
        # right=False means intervals are [left, right) except last is closed on both sides
        bins = pd.cut(temp["x"], bins=bin_edges, labels=False, include_lowest=True)
        temp["bin"] = bins

        # For each bin, calculate the center as representative x value
        bin_centers = {}
        for i in range(n_bins):
            left, right = bin_edges[i], bin_edges[i + 1]
            bin_centers[i] = (left + right) / 2

        temp["x_binned"] = temp["bin"].map(bin_centers)

    # Drop y < 0
    temp = temp[temp["y"] >= 0]
    filtered_count = len(temp)

    # For each bin (or raw x if no binning), keep only the row with the lowest y
    if n_bins is not None:
        group_col = "bin"
        x_representative = "x_binned"
    else:
        group_col = "x"
        x_representative = "x"

    idx = temp.groupby(group_col)["y"].idxmin()
    result = temp.loc[idx].sort_values(group_col).reset_index(drop=True)

    # Use binned center x values if binning was applied
    if n_bins is not None:
        result_for_output = pd.DataFrame({
            "x": result[x_representative],
            "y": result["y"]
        })
    else:
        result_for_output = result[["x", "y"]]

    final_count = len(result_for_output)

    # Write cleaned data
    result_for_output.to_csv(output_csv, index=False, header=has_header)
    print(f"Wrote {final_count} rows to '{output_csv}'")
    print(f"Discarded {original_count - filtered_count} rows (y < 0)")
    if n_bins is not None:
        print(f"Binned into {n_bins} bins, kept lowest y per bin")
    else:
        print(f"Kept lowest y per unique x value")

    # Plot if requested
    if plot_output:
        plt.figure(figsize=(10, 6))

        # Optional: show raw filtered data in light gray
        if filtered_count > final_count * 5:  # Only if there's a lot of raw data
            plt.scatter(temp["x"], temp["y"], s=5, alpha=0.3, color='gray', label='Raw filtered')

        # Show the lower envelope line
        plt.plot(result_for_output["x"], result_for_output["y"], 'b-', linewidth=2, label='Lower envelope')
        plt.scatter(result_for_output["x"], result_for_output["y"], c='blue', s=20, marker='o')

        plt.xlabel('X')
        plt.ylabel('Y')
        title_text = f'Lower Envelope Line ({final_count} points)'
        if n_bins is not None:
            title_text += f' [{n_bins} bins]'
        plt.title(title_text)
        plt.legend()
        plt.grid(True, alpha=0.3)

        # Save plot
        plt.savefig(plot_output, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"Saved plot to '{plot_output}'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Reduce noisy CSV scatter to its lower envelope line with configurable binning."
    )
    parser.add_argument("input", help="Input CSV file")
    parser.add_argument("output", help="Output CSV file for cleaned data")
    parser.add_argument("--plot", default=None, help="Save plot to this file (PNG/PDF/SVG)")
    parser.add_argument("--header", action="store_true", help="CSV has a header row")
    parser.add_argument("--xcol", default=0, type=int, help="Column index for x (default 0)")
    parser.add_argument("--ycol", default=1, type=int, help="Column index for y (default 1)")
    parser.add_argument(
        "--bins",
        default=None,
        type=int,
        help=f"Number of equal-width x bins (omit for exact x matching)"
    )
    args = parser.parse_args()

    if args.bins is not None and args.bins < 1:
        print("Error: --bins must be at least 1")
        exit(1)

    keep_lowest_line(
        args.input,
        args.output,
        args.plot,
        args.xcol,
        args.ycol,
        args.header,
        args.bins
    )