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
    return logging_helper.logger('levelshealth')

class DAL:
    def __init__(self, sources: Sequence[PathIsh]) -> None:
        self.sources = [p if isinstance(p, Path) else Path(p) for p in sources]


    def raw(self):
        for f in sorted(self.sources):
            with f.open(encoding="utf-8") as fo:
                yield json.load(fo)

    def glucoseScores(self) -> Iterator[Res[Json]]:
      for f in self.raw():
        for score in f["rawGlucose"]["data"]["glucoseMetrics"]["values"]:
          yield score

    def zones(self) -> Iterator[Res[Json]]:
      for f in self.raw():
        for zone in f["zones"]["data"]["findZones"]:
          yield zone

    def streaks(self) -> Iterator[Res[Json]]:
      for f in self.raw():
        for streak in f["streaks"]["data"]["metabolicFitnessStreaks"]["streaks"]:
          yield streak


if __name__ == '__main__':
    dal_helper.main(DAL=DAL)
