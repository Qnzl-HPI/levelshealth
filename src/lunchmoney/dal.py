#!/usr/bin/env python3

from pathlib import PurePath, Path
from typing import List, Dict, Union, Iterator, NamedTuple, Any, Sequence, Optional, Set
import json
from pathlib import Path
from datetime import datetime
import logging

import pytz

from .exporthelpers.dal_helper import PathIsh, Json, Res

def get_logger():
    return logging_helper.logger('lunchmoney')

class DAL:
    def __init__(self, sources: Sequence[PathIsh]) -> None:
        self.sources = [p if isinstance(p, Path) else Path(p) for p in sources]


    def raw(self):
        for f in sorted(self.sources):
            with f.open(encoding="utf-8") as fo:
                yield f, json.load(fo)

    def plaidAccounts(self) -> Iterator[Res[Json]]:
      for src in self.sources:
          try:
              j = json.loads(src.read_text())
          except Exception as e:
              ex = RuntimeError(f'While processing {src}')
              ex.__cause__ = e
              yield ex
              continue

          for plaidAccount in j['plaidAccounts']:
            yield plaidAccount

    def assets(self) -> Iterator[Res[Json]]:
      for src in self.sources:
          try:
              j = json.loads(src.read_text())
          except Exception as e:
              ex = RuntimeError(f'While processing {src}')
              ex.__cause__ = e
              yield ex
              continue

          for asset in j['assets']:
            yield asset

    def transactions(self) -> Iterator[Res[Json]]:
      for src in self.sources:
          try:
              j = json.loads(src.read_text())
          except Exception as e:
              ex = RuntimeError(f'While processing {src}')
              ex.__cause__ = e
              yield ex
              continue

          for transaction in j['transactions']:
            yield transaction

if __name__ == '__main__':
    dal_helper.main(DAL=DAL)
