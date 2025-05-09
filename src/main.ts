import { NodeRuntime } from "@effect/platform-node"
import { IssueifierLive } from "bot/Issueifier"
import { NoEmbedLive } from "bot/NoEmbed"
import { Summarizer } from "bot/Summarizer"
import { TracingLive } from "bot/Tracing"
import { Config, Effect, Layer, LogLevel, Logger, RuntimeFlags } from "effect"
import { ClusterLayer } from "./Cluster.js"

const LogLevelLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const debug = yield* Config.withDefault(Config.boolean("DEBUG"), false)
    const level = debug ? LogLevel.All : LogLevel.Info
    return Logger.minimumLogLevel(level)
  }),
)

const MainLive = Layer.mergeAll(
  ClusterLayer,
  NoEmbedLive,
  IssueifierLive,
  Summarizer.Default,
).pipe(
  Layer.provide(TracingLive),
  Layer.provide(LogLevelLive),
  Layer.provide(RuntimeFlags.disableRuntimeMetrics),
)

NodeRuntime.runMain(Layer.launch(MainLive))
