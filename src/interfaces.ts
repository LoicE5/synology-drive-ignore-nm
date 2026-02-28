export interface SynologyFilter {
    Version: {
      major: string
      minor: string
    }
    Common?: {
      black_char: string
      black_name: string
      max_length: string
      max_path: string
    }
    File?: {
      black_name: string
      black_prefix: string
      max_size: string
    }
    Directory?: {
      black_name: string
    }
    EA?: {}
}