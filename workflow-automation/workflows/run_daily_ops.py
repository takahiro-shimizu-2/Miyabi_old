"""
Run Daily Operations
====================

Entry point for MIYAVI Society daily routines.
Usage: python run_daily_ops.py [morning|evening]
"""

import sys
import os
import argparse

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from society.core.orchestrator import MiyabiOrchestrator, Intent

def main():
    parser = argparse.ArgumentParser(description="Run MIYAVI Society Daily Ops")
    parser.add_argument("routine", choices=["morning", "evening"], help="Routine type to execute")
    args = parser.parse_args()

    print(f"--- MIYAVI Society: Initiating {args.routine.title()} Protocol ---")

    # Initialize Engine
    orchestrator = MiyabiOrchestrator()

    # Formulate Intent
    action_map = {
        "morning": "morning_routine",
        "evening": "evening_routine"
    }

    intent = Intent(
        description=f"Execute {args.routine} operations",
        domain="ops",
        action=action_map[args.routine]
    )

    # Dispatch
    result = orchestrator.dispatch(intent)

    # Report
    print("\n--- Execution Report ---")
    print(f"Status: {result.get('status')}")
    print(f"Message: {result.get('message')}")
    if "timestamp" in result:
        print(f"Timestamp: {result['timestamp']}")

if __name__ == "__main__":
    main()
