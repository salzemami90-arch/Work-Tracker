"""Start Work Tracker on this laptop only."""

import argparse

from tracker import create_app


def main():
    parser = argparse.ArgumentParser(description='Local Work Tracker')
    parser.add_argument('--data-dir', help='Isolated data directory; default is project/data')
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    app = create_app(args.data_dir)
    print(f'Open http://127.0.0.1:{args.port} — press Control-C to stop.', flush=True)
    app.run(host='127.0.0.1', port=args.port, debug=False, use_reloader=False)


if __name__ == '__main__':
    main()
