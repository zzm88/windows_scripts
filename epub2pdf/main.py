import tkinter as tk
from tkinter import filedialog, ttk, messagebox
from converter import EPUBtoPDFConverter
import threading
import os

class EPUBConverterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("EPUB to PDF Converter")
        self.root.geometry("600x400")
        
        # Create main frame
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Input file selection
        self.input_label = ttk.Label(self.main_frame, text="Select EPUB file:")
        self.input_label.grid(row=0, column=0, sticky=tk.W, pady=5)
        
        self.input_path = tk.StringVar()
        self.input_entry = ttk.Entry(self.main_frame, textvariable=self.input_path, width=50)
        self.input_entry.grid(row=1, column=0, padx=5)
        
        self.browse_button = ttk.Button(self.main_frame, text="Browse", command=self.browse_input)
        self.browse_button.grid(row=1, column=1, padx=5)
        
        # Output directory selection
        self.output_label = ttk.Label(self.main_frame, text="Select output directory:")
        self.output_label.grid(row=2, column=0, sticky=tk.W, pady=5)
        
        self.output_path = tk.StringVar()
        self.output_entry = ttk.Entry(self.main_frame, textvariable=self.output_path, width=50)
        self.output_entry.grid(row=3, column=0, padx=5)
        
        self.output_button = ttk.Button(self.main_frame, text="Browse", command=self.browse_output)
        self.output_button.grid(row=3, column=1, padx=5)
        
        # Progress bar
        self.progress = ttk.Progressbar(self.main_frame, length=400, mode='indeterminate')
        self.progress.grid(row=4, column=0, columnspan=2, pady=20)
        
        # Convert button
        self.convert_button = ttk.Button(self.main_frame, text="Convert", command=self.start_conversion)
        self.convert_button.grid(row=5, column=0, columnspan=2, pady=10)
        
        # Status label
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        self.status_label = ttk.Label(self.main_frame, textvariable=self.status_var)
        self.status_label.grid(row=6, column=0, columnspan=2, pady=5)

    def browse_input(self):
        filename = filedialog.askopenfilename(
            filetypes=[("EPUB files", "*.epub"), ("All files", "*.*")]
        )
        if filename:
            self.input_path.set(filename)

    def browse_output(self):
        directory = filedialog.askdirectory()
        if directory:
            self.output_path.set(directory)

    def start_conversion(self):
        if not self.input_path.get() or not self.output_path.get():
            messagebox.showerror("Error", "Please select both input file and output directory")
            return
        
        self.progress.start()
        self.status_var.set("Converting...")
        self.convert_button.state(['disabled'])
        
        # Start conversion in a separate thread
        thread = threading.Thread(target=self.convert)
        thread.daemon = True
        thread.start()

    def convert(self):
        try:
            converter = EPUBtoPDFConverter()
            input_path = self.input_path.get()
            output_dir = self.output_path.get()
            
            # Generate output filename
            input_filename = os.path.basename(input_path)
            output_filename = os.path.splitext(input_filename)[0] + ".pdf"
            output_path = os.path.join(output_dir, output_filename)
            
            # Perform conversion
            converter.convert(input_path, output_path)
            
            self.root.after(0, self.conversion_complete, True)
        except Exception as e:
            self.root.after(0, self.conversion_complete, False, str(e))

    def conversion_complete(self, success, error_message=None):
        self.progress.stop()
        self.convert_button.state(['!disabled'])
        
        if success:
            self.status_var.set("Conversion completed successfully!")
            messagebox.showinfo("Success", "File converted successfully!")
        else:
            self.status_var.set(f"Error: {error_message}")
            messagebox.showerror("Error", f"Conversion failed: {error_message}")

def main():
    root = tk.Tk()
    app = EPUBConverterApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 