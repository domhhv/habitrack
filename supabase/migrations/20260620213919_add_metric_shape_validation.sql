-- noqa: disable=all
ALTER TABLE "public"."habit_metrics"
ADD CONSTRAINT "habit_metrics_config_shape_check" CHECK (
    jsonb_typeof(config) = 'object'
    AND CASE type
        WHEN 'scale' THEN (
            config ? 'min' AND config ? 'max' AND config ? 'step'
            AND jsonb_typeof(config -> 'min') = 'number'
            AND jsonb_typeof(config -> 'max') = 'number'
            AND jsonb_typeof(config -> 'step') = 'number'
        )
        WHEN 'choice' THEN (
            config ? 'options' AND jsonb_typeof(config -> 'options') = 'array'
        )
        WHEN 'percentage' THEN (config = '{}'::jsonb)
        ELSE TRUE
    END
);
-- noqa: enable=all

ALTER TABLE "public"."habit_metrics" VALIDATE CONSTRAINT "habit_metrics_config_shape_check";

SET check_function_bodies = "off";


CREATE OR REPLACE FUNCTION "public"."validate_metric_value"() -- noqa
RETURNS TRIGGER
LANGUAGE "plpgsql"
SET search_path TO "public", "pg_temp"
AS $function$
DECLARE
    value_type metric_type;
BEGIN
    SELECT type INTO value_type FROM "public"."habit_metrics" WHERE id = "new"."habit_metric_id";

    IF value_type IS NULL THEN
        RAISE EXCEPTION 'habit_metric % not found for metric value', "new"."habit_metric_id";
    END IF;

    IF jsonb_typeof(new.value) <> 'object' THEN
        RAISE EXCEPTION 'metric value must be a JSON object, got %', jsonb_typeof("new"."value");
    END IF;

    CASE value_type
        WHEN 'number', 'percentage', 'scale' THEN
            IF NOT ("new"."value" ? 'numericValue' AND jsonb_typeof("new"."value" -> 'numericValue') = 'number') THEN
                RAISE EXCEPTION '% metric value requires a numeric "numericValue"', value_type;
            END IF;
        WHEN 'duration' THEN
            IF NOT ("new"."value" ? 'durationMs' AND jsonb_typeof("new"."value" -> 'durationMs') = 'number') THEN
                RAISE EXCEPTION 'duration metric value requires a numeric "durationMs"';
            END IF;
        WHEN 'range' THEN
            IF NOT (
                "new"."value" ? 'rangeFrom' AND "new"."value" ? 'rangeTo'
                AND jsonb_typeof("new"."value" -> 'rangeFrom') = 'number'
                AND jsonb_typeof("new"."value" -> 'rangeTo') = 'number'
            ) THEN
                RAISE EXCEPTION 'range metric value requires numeric "rangeFrom" and "rangeTo"';
            END IF;
        WHEN 'choice' THEN
            IF NOT (
                ("new"."value" ? 'selectedOption' AND jsonb_typeof("new"."value" -> 'selectedOption') = 'string')
                OR ("new"."value" ? 'selectedOptions' AND jsonb_typeof("new"."value" -> 'selectedOptions') = 'array')
            ) THEN
                RAISE EXCEPTION 'choice metric value requires "selectedOption" or "selectedOptions"';
            END IF;
        WHEN 'boolean' THEN
            IF NOT ("new"."value" ? 'booleanValue' AND jsonb_typeof("new"."value" -> 'booleanValue') = 'boolean') THEN
                RAISE EXCEPTION 'boolean metric value requires a boolean "booleanValue"';
            END IF;
        WHEN 'text' THEN
            IF NOT ("new"."value" ? 'textValue' AND jsonb_typeof("new"."value" -> 'textValue') = 'string') THEN
                RAISE EXCEPTION 'text metric value requires a string "textValue"';
            END IF;
    END CASE;

    RETURN new;
END;
$function$;

CREATE TRIGGER validate_metric_value BEFORE INSERT OR UPDATE ON "public"."habit_stock_metric_defaults" FOR EACH ROW EXECUTE FUNCTION "public"."validate_metric_value"();

CREATE TRIGGER validate_metric_value BEFORE INSERT OR UPDATE ON "public"."occurrence_metric_values" FOR EACH ROW EXECUTE FUNCTION "public"."validate_metric_value"();
